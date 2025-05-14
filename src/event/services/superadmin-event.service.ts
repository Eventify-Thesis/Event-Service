import { Injectable } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { SettingRepository } from '../repositories/setting.repository';
import { PaymentInfoRepository } from '../repositories/payment-info.repository';
import { ShowRepository } from '../repositories/show.repository';
import { TicketTypeRepository } from '../repositories/ticket-type.repository';
import { EventStatus, MESSAGE } from '../event.constant';
import { Brackets } from 'typeorm';
import { AppException } from 'src/common/exceptions/app.exception';

@Injectable()
export class SuperAdminEventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly settingRepository: SettingRepository,
    private readonly paymentInfoRepository: PaymentInfoRepository,
    private readonly showRepository: ShowRepository,
    private readonly ticketTypeRepository: TicketTypeRepository,
  ) {}

  async list(_organizations: any, pagination, { keyword, status }: any) {
    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.setting', 'setting')
      .leftJoinAndSelect('event.shows', 'shows');

    if (status) {
      queryBuilder.andWhere('event.status = :status', { status });
    }

    if (keyword) {
      const searchKeyword = `%${keyword.trim()}%`;
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('event.eventName ILIKE :keyword', { keyword: searchKeyword })
            .orWhere('event.venueName ILIKE :keyword', {
              keyword: searchKeyword,
            })
            .orWhere('event.orgName ILIKE :keyword', {
              keyword: searchKeyword,
            });
        }),
      );
    }

    const [events, total] = await queryBuilder
      .select([
        'event.id',
        'event.eventName',
        'event.venueName',
        'event.status',
        'event.eventBannerUrl',
        'event.organizationId',
        'setting.url',
        'shows.id',
        'shows.startTime',
        'shows.endTime',
      ])
      .skip(pagination.limit * (pagination.page - 1))
      .take(pagination.limit)
      .getManyAndCount();

    const transformed = events.map((event) => {
      const data: any = {
        id: event.id,
        eventName: event.eventName,
        venueName: event.venueName,
        status: event.status,
        eventBannerUrl: event.eventBannerUrl,
        organizationId: event.organizationId,
        url: event.setting?.url || '',
        role: 'SUPERADMIN',
      };

      if (event.shows?.length > 0) {
        data.startTime = event.shows[0].startTime;
        data.endTime = event.shows[0].endTime;
      }

      return data;
    });

    return {
      docs: transformed,
      totalDocs: total,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
      currentPage: pagination.page,
    };
  }

  async findOne(eventId: number) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['setting', 'paymentInfo', 'shows'],
    });

    if (!event) {
      throw new AppException(MESSAGE.EVENT_NOT_FOUND);
    }

    return event;
  }

  async findShows(eventId: number) {
    const show = await this.showRepository
      .createQueryBuilder('shows')
      .leftJoinAndSelect('shows.ticketTypes', 'ticket_types')
      .leftJoin('shows.seatingPlan', 'seating_plans')
      .addSelect([
        'seating_plans.id',
        'seating_plans.name',
        'seating_plans.description',
        'seating_plans.locked',
      ])
      .where('shows.event_id = :eventId', { eventId })
      .getMany();

    if (!show) {
      throw new AppException(MESSAGE.SHOW_NOT_FOUND);
    }

    return show;
  }

  async censorEvent(eventId: number, status: EventStatus, currentStatus: EventStatus) {
    const validStatuses = [EventStatus.PUBLISHED, EventStatus.CANCELLED];
    if (!validStatuses.includes(status)) {
      throw new AppException(MESSAGE.INVALID_STATUS);
    }

    if (validStatuses.includes(currentStatus)) {
      throw new AppException(MESSAGE.EVENT_ALREADY_CENSORED);
    }

    const event = await this.findOne(eventId);
    if (!event) {
      throw new AppException(MESSAGE.EVENT_NOT_FOUND);
    }

    event.status = status;
    return await this.eventRepository.save(event);
  }

}
