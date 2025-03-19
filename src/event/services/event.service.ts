import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { PaymentInfo } from '../entities/payment-info.entity';
import { Setting } from '../entities/setting.entity';
import { Show } from '../entities/show.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(PaymentInfo)
    private readonly paymentInfoRepository: Repository<PaymentInfo>,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
  ) {}

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find({
      relations: ['paymentInfo', 'setting', 'shows'],
    });
  }

  async findOne(id: string): Promise<Event> {
    return this.eventRepository.findOne({
      where: { id },
    });
  }
  async remove(id: string): Promise<void> {
    await this.eventRepository.delete(id);
  }

  async checkExists(id: string) {
    const entity = await this.eventRepository.exists({
      where: { id },
    });

    return !!entity;
  }
}
