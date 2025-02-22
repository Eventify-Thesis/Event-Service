import { Injectable } from '@nestjs/common';
import { EventRepository } from './repositories/event.repository';
import { CreateDraftEventDto } from './dto/create-draft-event.dto';
import { UpdateEventSettingDto } from './dto/update-event-setting.dto';
import { SettingRepository } from './repositories/setting.repository';
import { UpdateEventPaymentInfoDto } from './dto/update-event-payment-info.dto';
import { PaymentInfoRepository } from './repositories/payment-info.repository';

@Injectable()
export class EventService {
  constructor(
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

  async upsert(createDraftEventDto: CreateDraftEventDto) {
    if (createDraftEventDto.id) {
      return await this.eventRepository.updateOne(
        {
          id: createDraftEventDto.id,
        },
        createDraftEventDto,
      );
    }
    return await this.eventRepository.create(createDraftEventDto);
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
