import { Inject, Injectable } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { SettingRepository } from '../repositories/setting.repository';
import { PaymentInfoRepository } from '../repositories/payment-info.repository';
import { CreateDraftEventDto } from '../dto/create-draft-event.dto';
import { UpdateEventSettingDto } from '../dto/update-event-setting.dto';
import { UpdateEventPaymentInfoDto } from '../dto/update-event-payment-info.dto';
import { ClerkClient, User } from '@clerk/backend';
import { ShowRepository } from '../repositories/show.repository';
import { UpdateEventShowDto } from '../dto/update-event-show.dto';
import { EventBriefResponse, EventDetailResponse } from '../dto/event-doc.dto';
import { AppException } from 'src/common/exceptions/app.exception';
import {
  AgeRestriction,
  BusinessType,
  EventStatus,
  MESSAGE,
} from '../event.constant';
import { MemberService } from 'src/member/services/member.service';
import { TicketTypeRepository } from '../repositories/ticket-type.repository';
import { Brackets, In } from 'typeorm';
import { DataSource } from 'typeorm';
import { Event } from '../entities/event.entity';

@Injectable()
export class PlannerEventService {
  constructor(
    @Inject('ClerkClient')
    private readonly clerkClient: ClerkClient,
    private readonly eventRepository: EventRepository,
    private readonly settingRepository: SettingRepository,
    private readonly paymentInfoRepository: PaymentInfoRepository,
    private readonly showRepository: ShowRepository,
    private readonly ticketTypeRepository: TicketTypeRepository,
    private readonly memberService: MemberService,
    private readonly dataSource: DataSource,
  ) {}

  async checkExists(query: Record<string, any>) {
    const entity = await this.eventRepository.findOne({
      where: query,
    });
    return !!entity;
  }

  async list(organizations: any, paramPagination, { keyword, status }: any) {
    let ids: string[] = [];
    if (!organizations) ids = [];
    else ids = Object.keys(organizations);
    const orgIds = ids.length > 0 ? ids.map((id) => id.split(':')[1]) : [];
    if (!status) status = EventStatus.UPCOMING;
    else if (status === 'PAST') status = EventStatus.PUBLISHED;

    if (orgIds.length === 0)
      return {
        docs: [],
        totalDocs: 0,
        limit: paramPagination.limit,
        totalPages: 0,
        currentPage: paramPagination.page,
      };

    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.setting', 'setting')
      .leftJoinAndSelect('event.shows', 'shows', 'shows.event_id = event.id')
      .where('event.status = :status', { status })
      .andWhere('event.organization_id IN (:...orgIds)', { orgIds });
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
      // .orderBy('event.created_at', 'DESC')
      .skip(paramPagination.limit * (paramPagination.page - 1))
      .take(paramPagination.limit)
      .getManyAndCount();

    const transformedEvents = events.map((event) => {
      const newEvent: any = {
        id: event.id,
        eventName: event.eventName,
        venueName: event.venueName,
        status: event.status,
        eventBannerUrl: event.eventBannerUrl,
        organizationId: event.organizationId,
        url: event.setting.url,
        role: organizations[`${event.id}:${event.organizationId}`]
          .split(':')[1]
          .toUpperCase(),
      };

      if (event.shows?.length > 0) {
        newEvent.startTime = event.shows[0].startTime;
        newEvent.endTime = event.shows[0].endTime;
      }

      return newEvent;
    });

    return {
      docs: transformedEvents,
      totalDocs: total,
      limit: paramPagination.limit,
      totalPages: Math.ceil(total / paramPagination.limit),
      currentPage: paramPagination.page,
    };
  }

  async getBrief(user: User, eventId: number) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    const brief = new EventBriefResponse();
    brief.id = event.id;
    brief.eventName = event.eventName;
    brief.eventLogoUrl = event.eventLogoUrl;
    brief.eventBannerUrl = event.eventBannerUrl;
    brief.organizationId = event.organizationId;

    const role = await this.memberService.getMemberRole(user.id, event.id);

    brief.role = role;
    return brief;
  }

  async upsert(user: User, createDraftEventDto: CreateDraftEventDto) {
    if (createDraftEventDto.id) {
      await this.eventRepository.update(
        createDraftEventDto.id,
        createDraftEventDto,
      );
      return await this.eventRepository.findOne({
        where: { id: createDraftEventDto.id },
      });
    }

    // Create event in database
    createDraftEventDto['organizationId'] = 'placeholder';
    const event = this.eventRepository.create(createDraftEventDto);
    await this.eventRepository.save(event);

    // Create organization in Clerk
    const organization = await this.memberService.assignOwner(
      user,
      event.id,
      createDraftEventDto.eventName,
    );

    // Create default setting
    const setting = this.settingRepository.create({
      event: event,
      messageAttendees: '',
      isPrivate: true,
      eventDescription: '',
      url: '',
      maximumAttendees: 0,
      ageRestriction: AgeRestriction.ALL_AGES,
    });
    await this.settingRepository.save(setting);

    // Create default payment info
    const paymentInfo = this.paymentInfoRepository.create({
      event: event,
      bankAccount: '',
      bankAccountName: '',
      bankAccountNumber: '',
      bankOffice: '',
      businessType: BusinessType.COMPANY,
      name: '',
      address: '',
      taxNumber: '',
    });
    await this.paymentInfoRepository.save(paymentInfo);

    // Update event with organizationId
    event.organizationId = organization.id;
    await this.eventRepository.save(event);

    return event;
  }

  async updateSetting(
    eventId: number,
    updateEventSettingDto: UpdateEventSettingDto,
  ) {
    const setting = await this.settingRepository.findOne({
      where: { event: { id: eventId } },
    });
    if (!setting) {
      throw new AppException(MESSAGE.SETTING_NOT_FOUND);
    }

    Object.assign(setting, updateEventSettingDto);
    return await this.settingRepository.save(setting);
  }

  async updatePaymentInfo(
    eventId: number,
    updateEventPaymentInfoDto: UpdateEventPaymentInfoDto,
  ) {
    // Update event status
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    event.status = EventStatus.PENDING_APPROVAL;
    await this.eventRepository.save(event);

    // Update payment info
    const paymentInfo = await this.paymentInfoRepository.findOne({
      where: { event: { id: eventId } },
    });
    if (!paymentInfo) {
      throw new AppException(MESSAGE.PAYMENT_INFO_NOT_FOUND);
    }

    Object.assign(paymentInfo, updateEventPaymentInfoDto);
    return await this.paymentInfoRepository.save(paymentInfo);
  }

  async updateShows(eventId: number, updateEventShowDto: UpdateEventShowDto) {
    // Using transaction to update shows and ticket types
    return await this.dataSource.transaction(async (entityManager) => {
      const event = await entityManager.getRepository(Event).findOne({
        where: { id: eventId },
        relations: ['shows', 'shows.ticketTypes'],
      });

      if (!event) {
        throw new AppException(MESSAGE.EVENT_NOT_FOUND);
      }

      // Delete shows that are not in the request
      const showIdsToKeep = updateEventShowDto.shows
        .map((showDto) => showDto.id)
        .filter(Boolean);

      if (showIdsToKeep.length > 0) {
        await entityManager
          .getRepository(this.showRepository.target)
          .createQueryBuilder()
          .delete()
          .where('eventId = :eventId', { eventId })
          .andWhere('id NOT IN (:...showIdsToKeep)', { showIdsToKeep })
          .execute();
      } else {
        // If no shows have IDs (all are new), delete all existing shows
        await entityManager
          .getRepository(this.showRepository.target)
          .createQueryBuilder()
          .delete()
          .where('eventId = :eventId', { eventId })
          .execute();
      }

      // Process each show
      const shows = [];
      for (const showDto of updateEventShowDto.shows) {
        let show;
        if (showDto.id) {
          // Update existing show
          show = await entityManager
            .getRepository(this.showRepository.target)
            .findOne({
              where: { id: showDto.id },
              relations: ['ticketTypes'],
            });
          show.startTime = showDto.startTime;
          show.endTime = showDto.endTime;
        } else {
          // Create new show
          show = entityManager
            .getRepository(this.showRepository.target)
            .create({
              event,
              startTime: showDto.startTime,
              endTime: showDto.endTime,
            });
        }

        // Save the show to get an ID if it's new
        show = await entityManager
          .getRepository(this.showRepository.target)
          .save(show);

        // Update/delete ticket types for this show
        const ticketTypeIds = showDto.ticketTypes
          .map((ticketDto) => ticketDto.id)
          .filter(Boolean);
        // Delete ticket types not present in the request
        await entityManager
          .getRepository(this.ticketTypeRepository.target)
          .createQueryBuilder()
          .delete()
          .where('show.id = :showId', { showId: show.id })
          .andWhere(
            ticketTypeIds.length > 0 ? 'id NOT IN (:...ticketTypeIds)' : '1=1',
            {
              ticketTypeIds,
            },
          )
          .execute();

        const ticketTypes = [];
        for (const ticketDto of showDto.ticketTypes) {
          let ticketType;
          if (ticketDto.id) {
            // Update existing ticket type
            ticketType = await entityManager
              .getRepository(this.ticketTypeRepository.target)
              .findOne({
                where: { id: ticketDto.id },
              });
            ticketType = {
              ...ticketDto
            };
          } else {
            // Create new ticket type
            ticketType = entityManager
              .getRepository(this.ticketTypeRepository.target)
              .create({
                ...ticketDto,
                show,
                event,
              });
          }
          ticketTypes.push(
            await entityManager
              .getRepository(this.ticketTypeRepository.target)
              .save(ticketType),
          );
        }

        show.ticketTypes = ticketTypes;
        shows.push(show);
      }

      return shows;
    });
  }

  async findOne(id: number) {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['setting', 'paymentInfo', 'shows'],
    });

    if (!event) {
      throw new AppException(MESSAGE.EVENT_NOT_FOUND);
    }

    return event;
  }

  async findSettings(eventId: number) {
    const setting = await this.settingRepository.findOne({
      where: { event: { id: eventId } },
      relations: ['event'],
    });

    if (!setting) {
      throw new AppException(MESSAGE.SETTING_NOT_FOUND);
    }

    return {
      ...setting,
      eventName: setting.event.eventName,
    };
  }

  async findPaymentInfo(eventId: number) {
    const paymentInfo = await this.paymentInfoRepository.findOne({
      where: { event: { id: eventId } },
    });

    if (!paymentInfo) {
      throw new AppException(MESSAGE.PAYMENT_INFO_NOT_FOUND);
    }

    return paymentInfo;
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

  async findTicketTypes(eventId: number) {
    return await this.ticketTypeRepository.find({
      where: { event: { id: eventId } },
    });
  }

  async findTicketTypesOfShow(eventId: number, showId: number) {
    const ticketTypes = await this.ticketTypeRepository
      .createQueryBuilder('ticket_types')
      .where('ticket_types.show_id = :showId', { showId })
      .leftJoinAndSelect(
        'ticket_types.seatCategoryMapping',
        'seat_category_mappings',
        'seat_category_mappings.show = :showId',
        { showId },
      )
      .getMany();

    return ticketTypes;
  }

  async remove(eventId: number) {
    await this.eventRepository.delete({ id: eventId });
  }
}
