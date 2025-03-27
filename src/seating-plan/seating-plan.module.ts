import { Module } from '@nestjs/common';
import { SeatingPlanService } from './seating-plan.service';
import { PlannerSeatingPlanController } from './controllers/planner/seating-plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatingPlan } from './entities/seating-plan.entity';
import { SeatingPlanRepository } from './repositories/seating-plan.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SeatingPlan, Event])],
  controllers: [PlannerSeatingPlanController],
  providers: [SeatingPlanService, SeatingPlanRepository],
})
export class SeatingPlanModule {}
