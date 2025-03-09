import { Injectable } from '@nestjs/common';
import { PaymentInfoRepository } from '../repositories/payment-info.repository';
import { SettingRepository } from '../repositories/setting.repository';
import { EventRepository } from '../repositories/event.repository';

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

  async findOne(query: Record<string, any>) {
    const entity = await this.eventRepository.findOne(query);

    return entity;
  }
}
