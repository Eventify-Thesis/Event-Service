import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './services/event.service';
import { PlannerEventController } from './controllers/planner/event.controller';
import { SuperAdminEventController } from './controllers/super-admin/event.controller';
import { Event } from './entities/event.entity';
import { PaymentInfo } from './entities/payment-info.entity';
import { Setting } from './entities/setting.entity';
import { Show } from './entities/show.entity';
import { TicketType } from './entities/ticket-type.entity';
import { EventRepository } from './repositories/event.repository';
import { SettingRepository } from './repositories/setting.repository';
import { PaymentInfoRepository } from './repositories/payment-info.repository';
import { ShowRepository } from './repositories/show.repository';
import { ClerkClientProvider } from 'src/providers/clerk-client.provider';
import { PlannerEventService } from './services/planner-event.service';
import { SuperAdminEventService } from './services/superadmin-event.service';
import { MemberModule } from 'src/member/member.module';
import { TicketTypeRepository } from './repositories/ticket-type.repository';
import { PlannerEventMicroservice } from './controllers/planner/event.microservice';
import { EventController } from './controllers/common/event.controller';
import { EventMicroservice } from './controllers/common/event.microservice';
import { City } from 'src/location/entities/city.entity';
import { District } from 'src/location/entities/district.entity';
import { Ward } from 'src/location/entities/ward.entity';
import { EventStatsService } from './services/event-stats.service';
import { EventDailyStatistics, EventStatistics } from './entities/event-statistics.entity';

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
      EventDailyStatistics
    ]),
    MemberModule,
  ],
  controllers: [
    PlannerEventController,
    PlannerEventMicroservice,
    EventMicroservice,
    EventController,
    SuperAdminEventController,
  ],
  providers: [
    ClerkClientProvider,
    EventService,
    PlannerEventService,
    SuperAdminEventService,
    EventRepository,
    SettingRepository,
    PaymentInfoRepository,
    ShowRepository,
    TicketTypeRepository,
    EventStatsService,
  ],
  exports: [
    EventService,
    EventRepository,
    SettingRepository,
    PaymentInfoRepository,
  ],
})
export class EventModule { }
