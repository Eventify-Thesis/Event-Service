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
import { EventStatus, MESSAGE } from '../event.constant';
import path from 'path';
import { MemberService } from 'src/member/services/member.service';

@Injectable()
export class PlannerEventService {
  constructor(
    @Inject('ClerkClient')
    private readonly clerkClient: ClerkClient,
    private readonly eventRepository: EventRepository,
    private readonly settingRepository: SettingRepository,
    private readonly paymentInfoRepository: PaymentInfoRepository,
    private readonly showRepository: ShowRepository,
    private readonly memberService: MemberService,
  ) {}
  async checkExists(query: Record<string, any>) {
    const entity = await this.eventRepository.exists({
      ...query,
    });

    return !!entity;
  }

  async list(organizations: any, paramPagination, { keyword, status }: any) {
    const orgIds = Object.keys(organizations);
    if (!status) status = EventStatus.UPCOMING;
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
            organizationId: { $in: orgIds },
            ...(condition.length ? { $or: condition } : {}),
          },
        ],
      },
      select: [
        'eventName',
        'venueName',
        'status',
        'eventBannerURL',
        'organizationId',
      ],
      populate: [
        {
          path: 'setting',
          select: 'url',
        },
        {
          path: 'show',
          select: 'showings',
        },
      ],
      ...paramPagination,
    });

    const newEvents = events.docs.map((event) => {
      const newEvent = event.toObject();

      newEvent['url'] = event.setting['url'];
      delete newEvent.setting;

      if (event.show['showings'].length > 0) {
        newEvent['startTime'] = event.show['showings'][0].startTime;
        newEvent['endTime'] = event.show['showings'][0].endTime;
      }

      delete newEvent.show;

      newEvent['role'] = organizations[event.organizationId]
        .split(':')[1]
        .toUpperCase();

      newEvent['id'] = event._id.toString();
      delete newEvent._id;
      return newEvent;
    });

    return { ...events, docs: newEvents };
  }

  async getBrief(user: User, eventId: string) {
    const event = await this.eventRepository.findOne({ _id: eventId });

    const brief = new EventBriefResponse();
    brief.id = event._id.toString();
    brief.eventName = event.eventName;
    brief.eventLogoURL = event.eventLogoURL;
    brief.eventBannerURL = event.eventBannerURL;
    brief.organizationId = event.organizationId;

    const role = await this.memberService.getMemberRole(
      user.id,
      event._id.toString(),
    );

    brief.role = role;
    return brief;
  }

  async upsert(user: User, createDraftEventDto: CreateDraftEventDto) {
    if (createDraftEventDto.id) {
      return await this.eventRepository.findByIdAndUpdate(
        createDraftEventDto.id,
        createDraftEventDto,
        { new: true },
      );
    }
    // Create event in database
    const event = await this.eventRepository.create(createDraftEventDto);

    // Create organization in Clerk
    const organization = await this.memberService.assignOwner(
      user,
      event.id,
      createDraftEventDto.eventName,
    );
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
    await this.eventRepository.updateOne(
      {
        _id: eventId,
      },
      {
        status: EventStatus.PENDING_APPROVAL,
      },
    );

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
    const event = await this.eventRepository.findOne({
      _id: id,
    });

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
    const event = await this.eventRepository.findOne({ _id: eventId });
    if (!setting) {
      throw new AppException(MESSAGE.SETTING_NOT_FOUND);
    }

    return { ...setting.toObject(), eventName: event.eventName };
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
