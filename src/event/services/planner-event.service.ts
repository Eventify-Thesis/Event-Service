import { Inject, Injectable } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { SettingRepository } from '../repositories/setting.repository';
import { PaymentInfoRepository } from '../repositories/payment-info.repository';
import { CreateDraftEventDto } from '../dto/create-draft-event.dto';
import { UpdateEventSettingDto } from '../dto/update-event-setting.dto';
import { UpdateEventPaymentInfoDto } from '../dto/update-event-payment-info.dto';
import { ClerkClient } from '@clerk/backend';

@Injectable()
export class PlannerEventService {
  constructor(
    @Inject('ClerkClient')
    private readonly clerkClient: ClerkClient,
    private readonly eventRepository: EventRepository,
    private readonly settingRepository: SettingRepository,
    private readonly paymentInfoRepository: PaymentInfoRepository,
  ) {}
  async checkExists(query: Record<string, any>) {
    const entity = await this.eventRepository.exists({
      ...query,
    });

    return !!entity;
  }

  async upsert(userId: string, createDraftEventDto: CreateDraftEventDto) {
    if (createDraftEventDto.id) {
      await this.eventRepository.updateOne(
        {
          id: createDraftEventDto.id,
        },
        createDraftEventDto,
      );
      return createDraftEventDto;
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
      })

    // Update event with organizationId

    await this.eventRepository.updateOne(
      {
        _id: event.id,
      },
      {
        organizationId: organization.id,
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
