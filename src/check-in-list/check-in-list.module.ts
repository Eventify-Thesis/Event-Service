import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckInListService } from './services/check-in-list.service';
import { PlannerCheckInListController } from './controllers/planner/check-in-list.controller';
import { CheckInList } from './entities/check-in-list.entity';
import { PlannerCheckInController } from './controllers/planner/check-in.controller';
import { CheckInService } from './services/check-in.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckInList]),
  ],
  controllers: [PlannerCheckInListController, PlannerCheckInController],
  providers: [
    CheckInListService, 
    CheckInService,
  ],
  exports: [
    CheckInListService,
  ],
})
export class CheckInListModule { }
