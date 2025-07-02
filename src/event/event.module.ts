import { Module, forwardRef } from '@nestjs/common';
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
import { QuestionModule } from 'src/question/question.module';
import { SeatingPlanModule } from 'src/seating-plan/seating-plan.module';
import { TicketTypeRepository } from './repositories/ticket-type.repository';
import { PlannerEventMicroservice } from './controllers/planner/event.microservice';
import { EventController } from './controllers/common/event.controller';
import { EventMicroservice } from './controllers/common/event.microservice';
import { City } from 'src/location/entities/city.entity';
import { District } from 'src/location/entities/district.entity';
import { Ward } from 'src/location/entities/ward.entity';
import { EventStatsService } from './services/event-stats.service';
import { EventDailyStatistics, EventStatistics } from './entities/event-statistics.entity';
import { EventStatisticsRepository } from './repositories/event-statistics.repository';
import { EventDailyStatisticsRepository } from './repositories/event-daily-statistics.repository';
import { MessageModule } from 'src/message/message.module';
import { Quiz } from 'src/quiz/entities/quiz.entity';
import { QuizQuestion } from 'src/quiz/entities/quiz-question.entity';
import { QuizAnswer } from 'src/quiz/entities/quiz-answer.entity';
import { QuizResult } from 'src/quiz/entities/quiz-result.entity';
import { OrderModule } from 'src/order/order.module';
import { CheckInListModule } from 'src/check-in-list/check-in-list.module';
import { VoucherModule } from 'src/voucher/voucher.module';
import { KanbanModule } from 'src/kanban/kanban.module';
import { FacebookModule } from 'src/facebook/facebook.module';
import { QuizModule } from 'src/quiz/quiz.module';
import { AttendeeModule } from 'src/attendee/attendee.module';
import { ShowScheduleModule } from 'src/show-schedule/show-schedule.module';
import { ShowScheduleRepository } from 'src/show-schedule/repositories/show-schedule.repository';

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
      Quiz,
      QuizQuestion,
      QuizAnswer,
      QuizResult
    ]),
    MemberModule,
    QuestionModule,
    SeatingPlanModule,
    MessageModule,
    OrderModule,
    CheckInListModule,
    VoucherModule,
    KanbanModule,
    FacebookModule,
    QuizModule,
    AttendeeModule,
    forwardRef(() => ShowScheduleModule),
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
    EventStatsService,
    EventRepository,
    SettingRepository,
    PaymentInfoRepository,
    ShowRepository,
    TicketTypeRepository,
    EventStatisticsRepository,
    EventDailyStatisticsRepository,
    ShowScheduleRepository,
  ],
  exports: [
    EventService,
    EventRepository,
    SettingRepository,
    PaymentInfoRepository,
    ShowRepository,
    TicketTypeRepository,
    EventStatisticsRepository,
    EventDailyStatisticsRepository,
    ShowScheduleRepository,
  ],
})
export class EventModule { }
