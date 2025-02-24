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

  async upsert(userId: string, createDraftEventDto: CreateDraftEventDto) {
    if (createDraftEventDto.id) {
      return await this.eventRepository.updateOne(
        {
          id: createDraftEventDto.id,
        },
        createDraftEventDto,
        {
          new: true,
        }
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

    // Update event with organizationId

    await this.eventRepository.updateOne(
      {
        _id: event.id,
      },
      {
        organizationId: organization.id,
      },
    );

    // Create default setting and payment info

    await this.settingRepository.create({
      eventId: event.id,
      messageAttendees: '',
      isPrivate: true,
      eventDescription: '',
    });

    await this.paymentInfoRepository.create({
      eventId: event.id,
      bankAccount: '',
      bankAccountName: '',
      bankAccountNumber: '',
      bankOffice: '',
      companyName: '',
      companyAddress: '',
      taxNumber: '',
    });

    await this.showRepository.create({
      eventId: event.id,
    });

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

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  // update(id: number, updateEventDto: UpdateEventDto) {
  //   return `This action updates a #${id} event`;
  // }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
