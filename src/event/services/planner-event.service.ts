import { Inject, Injectable } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { SettingRepository } from '../repositories/setting.repository';
import { PaymentInfoRepository } from '../repositories/payment-info.repository';
import { CreateDraftEventDto } from '../dto/create-draft-event.dto';
import { UpdateEventSettingDto } from '../dto/update-event-setting.dto';
import { UpdateEventPaymentInfoDto } from '../dto/update-event-payment-info.dto';
import { ClerkClient } from '@clerk/backend';
import { ShowRepository } from '../repositories/show.repository';
import { UpdateEventShowDto } from '../dto/update-event-show.dto';
import { EventDetailResponse } from '../dto/event-doc.dto';
import { AppException } from 'src/common/exceptions/app.exception';
import { EventStatus, MESSAGE } from '../event.constant';
import path from 'path';

@Injectable()
export class PlannerEventService {
  constructor(
    @Inject('ClerkClient')
    private readonly clerkClient: ClerkClient,
    private readonly eventRepository: EventRepository,
    private readonly settingRepository: SettingRepository,
    private readonly paymentInfoRepository: PaymentInfoRepository,
    private readonly showRepository: ShowRepository,
  ) {}
  async checkExists(query: Record<string, any>) {
    const entity = await this.eventRepository.exists({
      ...query,
    });

    return !!entity;
  }

  async list(paramPagination, { keyword, status }: any) {
    if (!status) status = EventStatus.INCOMING;
    const condition = [];

    if (keyword) {
      keyword = new RegExp(
        keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'gi',
      );
      condition.push({
        $or: [
          { eventName: { $regex: keyword } },
          { venueName: { $regex: keyword } },
          { orgName: { $regex: keyword } },
        ],
      });
    }

    const events = await this.eventRepository.pagination({
      conditions: {
        $and: [
          {
            status: status,
            ...(condition.length ? { $or: condition } : {}),
          },
        ],
      },
      select: ['eventName', 'venueName', 'status', 'eventBannerURL'],
      populate: {
        path: 'setting',
        select: 'url',
      },
      ...paramPagination,
    });

    return events;
  }

  async upsert(userId: string, createDraftEventDto: CreateDraftEventDto) {
    if (createDraftEventDto.id) {
      return await this.eventRepository.updateOne(
        {
          id: createDraftEventDto.id,
        },
        createDraftEventDto,
        {
          new: true,
        },
      );
    }
    // Create event in database
    const event = await this.eventRepository.create(createDraftEventDto);

    // Create organization in Clerk
    const organization =
      await this.clerkClient.organizations.createOrganization({
        name: createDraftEventDto.eventName,
        maxAllowedMemberships: 100,
        publicMetadata: {
          eventId: event.id,
        },
      });

    // Add the current user as owner of the organization
    await this.clerkClient.organizations.createOrganizationMembership({
      organizationId: organization.id,
      userId: userId,
      role: 'org:owner',
    });

    // Create default setting and payment info

    const setting = await this.settingRepository.create({
      eventId: event.id,
      messageAttendees: '',
      isPrivate: true,
      eventDescription: '',
      url: '',
    });

    const paymentInfo = await this.paymentInfoRepository.create({
      eventId: event.id,
      bankAccount: '',
      bankAccountName: '',
      bankAccountNumber: '',
      bankOffice: '',
      companyName: '',
      companyAddress: '',
      taxNumber: '',
    });

    const show = await this.showRepository.create({
      eventId: event.id,
    });

    // Update event with organizationId, payment info, setting and shows

    await this.eventRepository.updateOne(
      {
        _id: event.id,
      },
      {
        organizationId: organization.id,
        paymentInfo: paymentInfo,
        setting: setting,
        show: show,
      },
    );

    return event;
  }

  async updateSetting(
    eventId: string,
    updateEventSettingDto: UpdateEventSettingDto,
  ) {
    return await this.settingRepository.updateOne(
      {
        eventId: eventId,
      },
      updateEventSettingDto,
    );
  }

  async updatePaymentInfo(
    eventId: string,
    updateEventPaymentInfoDto: UpdateEventPaymentInfoDto,
  ) {
    return await this.paymentInfoRepository.updateOne(
      {
        eventId: eventId,
      },
      updateEventPaymentInfoDto,
    );
  }

  async updateShow(eventId: string, updateEventShowDto: UpdateEventShowDto) {
    // Update the show information
    const updatedShow = await this.showRepository.updateOne(
      { eventId: eventId },
      {
        $set: {
          showings: updateEventShowDto.showings,
        },
      },
      { new: true }, // Return the updated document
    );

    return updatedShow;
  }

  findAll() {
    return `This action returns all event`;
  }

  async findOne(id: string) {
    // Find the main event document
    const event = await this.eventRepository.findById(id);

    // Find related documents
    const [setting, paymentInfo, show] = await Promise.all([
      this.settingRepository.findOne({ eventId: id }),
      this.paymentInfoRepository.findOne({ eventId: id }),
      this.showRepository.findOne({ eventId: id }),
    ]);

    return {
      ...event.toObject(),
      setting: setting?.toObject(),
      paymentInfo: paymentInfo?.toObject(),
      show: show?.toObject(),
    };
  }

  async findSettings(eventId: string) {
    const setting = await this.settingRepository.findOne({ eventId });
    if (!setting) {
      throw new AppException(MESSAGE.SETTING_NOT_FOUND);
    }

    return setting.toObject();
  }

  async findPaymentInfo(eventId: string) {
    const paymentInfo = await this.paymentInfoRepository.findOne({ eventId });
    if (!paymentInfo) {
      throw new AppException(MESSAGE.PAYMENT_INFO_NOT_FOUND);
    }

    return paymentInfo.toObject();
  }

  async findShows(eventId: string) {
    const show = await this.showRepository.findOne({ eventId });
    if (!show) {
      throw new AppException(MESSAGE.SHOW_NOT_FOUND);
    }

    return show.toObject();
  }

  async remove(eventId: string) {
    await this.eventRepository.deleteOne({ _id: eventId });
  }
}
