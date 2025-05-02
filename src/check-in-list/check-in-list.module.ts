import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckInListService } from './check-in-list.service';
import { PlannerCheckInListController } from './controllers/planner/check-in-list.controller';
import { CheckInList } from './entities/check-in-list.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckInList]),
  ],
  controllers: [PlannerCheckInListController],
  providers: [CheckInListService],
  exports: [CheckInListService],
})
export class CheckInListModule { }
