import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoEventController } from './controllers/demo/demo-event.controller';
import { PlannerEventService } from './services/planner-event.service';
import { SuperAdminEventService } from './services/superadmin-event.service';
import { EventService } from './services/event.service';
import { MemberModule } from '../member/member.module';
import { Event } from './entities/event.entity';
import { Setting } from './entities/setting.entity';
import { PaymentInfo } from './entities/payment-info.entity';
import { Show } from './entities/show.entity';
import { TicketType } from './entities/ticket-type.entity';
import { EventRepository } from './repositories/event.repository';
import { SettingRepository } from './repositories/setting.repository';
import { PaymentInfoRepository } from './repositories/payment-info.repository';
import { ShowRepository } from './repositories/show.repository';
import { TicketTypeRepository } from './repositories/ticket-type.repository';
import { ClerkClientProvider } from 'src/providers/clerk-client.provider';
import { City } from 'src/location/entities/city.entity';
import { District } from 'src/location/entities/district.entity';
import { Ward } from 'src/location/entities/ward.entity';
import {
  EventStatistics,
  EventDailyStatistics,
} from './entities/event-statistics.entity';
import { EventStatsService } from './services/event-stats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      PaymentInfo,
      Setting,
      Show,
      TicketType,
      City,
      District,
      Ward,
      EventStatistics,
      EventDailyStatistics,
    ]),
    MemberModule,
  ],
  controllers: [DemoEventController],
  providers: [
    ClerkClientProvider,
    EventService,
    PlannerEventService,
    SuperAdminEventService,
    EventStatsService,
    EventRepository,
    SettingRepository,
    PaymentInfoRepository,
    ShowRepository,
    TicketTypeRepository,
  ],
  exports: [PlannerEventService],
})
export class DemoEventModule {}
