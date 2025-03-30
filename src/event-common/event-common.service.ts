import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from 'src/event/entities/event.entity';
import { Setting } from 'src/event/entities/setting.entity';
import { Show } from 'src/event/entities/show.entity';
import { PaymentInfo } from 'src/event/entities/payment-info.entity';

@Injectable()
export class EventCommonService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
    @InjectRepository(PaymentInfo)
    private readonly paymentInfoRepository: Repository<PaymentInfo>,
  ) {}

  async findAllShowings(eventId: string) {
    const show = await this.showRepository.findOne({
      where: { event: { id: eventId } },
      relations: ['ticketTypes'],
      select: {
        id: true,
        startTime: true,
        endTime: true,
        ticketTypes: {
          id: true,
          name: true,
          startTime: true,
          endTime: true,
          quantity: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    });

    if (!show) {
      return [];
    }

    const currentTime = new Date();

    // Now we return the show with its tickets
    return {
      startTime: show.startTime,
      endTime: show.endTime,
      isSelectable:
        currentTime >= show.startTime && currentTime <= show.endTime,
      ticketTypes: show.ticketTypes.map((ticketType) => ({
        ...ticketType,
        isSelectable:
          currentTime >= ticketType.startTime &&
          currentTime <= ticketType.endTime,
      })),
    };
  }
}
