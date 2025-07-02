import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckInListService } from './services/check-in-list.service';
import { PlannerCheckInListController } from './controllers/planner/check-in-list.controller';
import { CheckInList } from './entities/check-in-list.entity';
import { PlannerCheckInController } from './controllers/planner/check-in.controller';
import { CheckInService } from './services/check-in.service';
import { AttendeeCheckIn } from './entities/attendee-check-in.entity';
import { AttendeeCheckInRepository } from './repositories/attendee-check-in.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CheckInList,
      AttendeeCheckIn
    ]),
  ],
  controllers: [PlannerCheckInListController, PlannerCheckInController],
  providers: [
    CheckInListService, 
    CheckInService,
    AttendeeCheckInRepository
  ],
  exports: [
    CheckInListService,
    AttendeeCheckInRepository
  ],
})
export class CheckInListModule { }
