import { Module } from '@nestjs/common';
import { SeatingPlanService } from './seating-plan.service';
import { PlannerSeatingPlanController } from './controllers/planner/seating-plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatingPlan } from './entities/seating-plan.entity';
import { SeatingPlanRepository } from './repositories/seating-plan.repository';
import { SeatCategoryMapping } from './entities/seat-category-mapping.entity';
import { PlannerSeatCategoryMappingController } from './controllers/planner/seat-category-mapping.controller';
import { SeatCategoryMappingService } from './services/seat-category-mapping.service';
import { SeatCategoryMappingRepository } from './repositories/seat-category-mapping.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SeatingPlan, SeatCategoryMapping])],
  controllers: [
    PlannerSeatingPlanController,
    PlannerSeatCategoryMappingController,
  ],
  providers: [
    SeatingPlanService,
    SeatingPlanRepository,
    SeatCategoryMappingService,
    SeatCategoryMappingRepository,
  ],
})
export class SeatingPlanModule {}
