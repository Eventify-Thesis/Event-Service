import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './services/event.service';
import { PlannerEventController } from './controllers/planner/event.controller';
import { Event } from './entities/event.entity';
import { PaymentInfo } from './entities/payment-info.entity';
import { Setting } from './entities/setting.entity';
import { Show } from './entities/show.entity';
import { Ticket } from './entities/ticket.entity';
import { EventRepository } from './repositories/event.repository';
import { SettingRepository } from './repositories/setting.repository';
import { PaymentInfoRepository } from './repositories/payment-info.repository';
import { ShowRepository } from './repositories/show.repository';
import { TicketRepository } from './repositories/ticket.repository';
import { ClerkClientProvider } from 'src/providers/clerk-client.provider';
import { PlannerEventService } from './services/planner-event.service';
import { MemberModule } from 'src/member/member.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, PaymentInfo, Setting, Show, Ticket]),
    MemberModule,
  ],
  controllers: [PlannerEventController],
  providers: [
    ClerkClientProvider,
    EventService,
    PlannerEventService,
    EventRepository,
    SettingRepository,
    PaymentInfoRepository,
    ShowRepository,
    TicketRepository,
  ],
  exports: [
    EventService,
    EventRepository,
    SettingRepository,
    PaymentInfoRepository,
  ],
})
export class EventModule {}
