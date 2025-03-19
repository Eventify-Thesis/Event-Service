import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventCommonService } from './event-common.service';
import { Event } from 'src/event/entities/event.entity';
import { Setting } from 'src/event/entities/setting.entity';
import { Show } from 'src/event/entities/show.entity';
import { PaymentInfo } from 'src/event/entities/payment-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Setting, Show, PaymentInfo])],
  providers: [EventCommonService],
  exports: [EventCommonService],
})
export class EventCommonModule {}
