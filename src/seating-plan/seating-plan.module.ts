import { Module } from '@nestjs/common';
import { SeatingPlanService } from './services/seating-plan.service';
import { PlannerSeatingPlanController } from './controllers/planner/seating-plan.controller';
import { SeatingPlanRepository } from './repositories/seating-plan.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Show } from 'src/event/entities/show.entity';
import { SeatRepository } from './repositories/seat.repository';
import { Seat } from './entities/seat.entity';
import { SeatingPlan } from './entities/seating-plan.entity';
import { SeatCategoryMapping } from './entities/seat-category-mapping.entity';
import { PlannerSeatCategoryMappingController } from './controllers/planner/seat-category-mapping.controller';
import { SeatCategoryMappingService } from './services/seat-category-mapping.service';
import { SeatCategoryMappingRepository } from './repositories/seat-category-mapping.repository';
import { SeatingPlanMicroservice } from './controllers/common/seating-plan.microservice';

@Module({
  imports: [
    TypeOrmModule.forFeature([SeatingPlan, SeatCategoryMapping, Show, Seat]),
  ],
  controllers: [
    SeatingPlanMicroservice,
    PlannerSeatingPlanController,
    PlannerSeatCategoryMappingController,
  ],
  providers: [
    SeatingPlanService,
    SeatingPlanRepository,
    SeatCategoryMappingService,
    SeatCategoryMappingRepository,
    SeatRepository,
  ],
  exports: [
    SeatingPlanService,
    SeatCategoryMappingRepository,
  ],
})
export class SeatingPlanModule {}
