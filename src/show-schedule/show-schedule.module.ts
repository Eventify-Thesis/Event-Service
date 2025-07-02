import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowScheduleService } from './show-schedule.service';
import { PlannerShowScheduleController } from './controllers/planner/show-schedule.controller';
import { ShowSchedule } from './entities/show-schedule.entity';
import { Show } from 'src/event/entities/show.entity';
import { ShowService } from './show.service';
import { CommonShowScheduleController } from './controllers/common/show-schedule.controller';
import { ShowScheduleRepository } from './repositories/show-schedule.repository';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShowSchedule, 
      Show
    ]),
    forwardRef(() => EventModule)
  ],
  controllers: [
    PlannerShowScheduleController, 
    CommonShowScheduleController
  ],
  providers: [
    ShowScheduleService, 
    ShowService,
    ShowScheduleRepository
  ],
  exports: [
    ShowScheduleService,
    ShowScheduleRepository
  ],
})
export class ShowScheduleModule {}
