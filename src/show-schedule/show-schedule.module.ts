import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowScheduleService } from './show-schedule.service';
import { PlannerShowScheduleController } from './controllers/planner/show-schedule.controller';
import { ShowSchedule } from './entities/show-schedule.entity';
import { Show } from 'src/event/entities/show.entity';
import { ShowService } from './show.service';
import { CommonShowScheduleController } from './controllers/common/show-schedule.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShowSchedule, Show])],
  controllers: [PlannerShowScheduleController, CommonShowScheduleController],
  providers: [ShowScheduleService, ShowService],
  exports: [ShowScheduleService],
})
export class ShowScheduleModule {}
