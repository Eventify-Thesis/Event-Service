import { Injectable } from '@nestjs/common';
import { EventCommonRepository } from './repositories/event.repository';
import { SettingCommonRepository } from './repositories/setting.repository';
import { PaymentInfoCommonRepository } from './repositories/payment-info.repository';
import { ShowCommonRepository } from './repositories/show.repository';
import { TicketCommonRepository } from './repositories/ticket-type.repository';

@Injectable()
export class EventCommonService {
  constructor(
    private readonly eventRepository: EventCommonRepository,
    private readonly settingRepository: SettingCommonRepository,
    private readonly paymentInfoRepository: PaymentInfoCommonRepository,
    private readonly showRepository: ShowCommonRepository,
    private readonly ticketRepository: TicketCommonRepository,
  ) {}

  async findAllShowings(eventId: string) {
    const show = await this.showRepository.model.findOne({ eventId }).populate([
      {
        path: 'showings.tickets',
        select:
          '+ name + startTime +endTime + quantity + createdAt + updatedAt',
      },
    ]);

    if (!show || !show.showings) {
      return [];
    }

    const currentTime = new Date();
    const showings = show.showings.map((showing) => ({
      startTime: showing.startTime,

      endTime: showing.endTime,
      tickets: showing.tickets.map((ticket) => {
        return {
          ...ticket.toObject(),
          isSelectable:
            currentTime >= ticket.startTime && currentTime <= ticket.endTime,
        };
      }),
      isSelectable:
        currentTime >= showing.startTime && currentTime <= showing.endTime,
    }));

    return showings;
  }
}
