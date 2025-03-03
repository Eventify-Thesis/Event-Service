import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from './entities/event.entity';
import { PaymentInfo, PaymentInfoSchema } from './entities/payment-info.entity';
import { Setting, SettingSchema } from './entities/setting.entity';
import { PlannerEventController } from './controllers/planner/event.controller';
import { EventRepository } from './repositories/event.repository';
import { SettingRepository } from './repositories/setting.repository';
import { PaymentInfoRepository } from './repositories/payment-info.repository';
import { ClerkClientProvider } from 'src/providers/clerk-client.provider';
import { PlannerEventService } from './services/planner-event.service';
import { EventService } from './services/event.service';
import { ShowRepository } from './repositories/show.repository';
import { Show, ShowSchema } from './entities/show.entity';
import { MemberModule } from 'src/member/member.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    MongooseModule.forFeature([
      { name: PaymentInfo.name, schema: PaymentInfoSchema },
    ]),
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
    MongooseModule.forFeature([{ name: Show.name, schema: ShowSchema }]),
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
  ],
  exports: [
    EventService,
    EventRepository,
    SettingRepository,
    PaymentInfoRepository,
  ],
})
export class EventModule {}
