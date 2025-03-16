import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventCommonService } from './event-common.service';
import { Event, EventSchema } from '../event/entities/event.entity';
import { Setting, SettingSchema } from '../event/entities/setting.entity';
import { Show, ShowSchema } from '../event/entities/show.entity';
import {
  PaymentInfo,
  PaymentInfoSchema,
} from '../event/entities/payment-info.entity';
import { Ticket, TicketSchema } from '../event/entities/ticket-type.entity';
import { EventCommonRepository } from './repositories/event.repository';
import { SettingCommonRepository } from './repositories/setting.repository';
import { ShowCommonRepository } from './repositories/show.repository';
import { PaymentInfoCommonRepository } from './repositories/payment-info.repository';
import { TicketCommonRepository } from './repositories/ticket-type.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Setting.name, schema: SettingSchema },
      { name: Show.name, schema: ShowSchema },
      { name: PaymentInfo.name, schema: PaymentInfoSchema },
      { name: Ticket.name, schema: TicketSchema },
    ]),
  ],
  providers: [
    EventCommonService,
    EventCommonRepository,
    SettingCommonRepository,
    ShowCommonRepository,
    PaymentInfoCommonRepository,
    TicketCommonRepository,
  ],
  exports: [
    EventCommonService,
    EventCommonRepository,
    SettingCommonRepository,
    PaymentInfoCommonRepository,
    ShowCommonRepository,
    TicketCommonRepository,
  ],
})
export class EventCommonModule {}
