// planner-event.microservice.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SeatingPlanService } from 'src/seating-plan/services/seating-plan.service';

@Controller()
export class SeatingPlanMicroservice {
  constructor(private readonly seatingPlanService: SeatingPlanService) {}

  @MessagePattern('getEventShowSeatingPlan')
  async getEventShowSeatingPlan(
    @Payload()
    payload: {
      id: number;
      seatingPlanId: number;
    },
  ) {
    try {
      return await this.seatingPlanService.getEventShowSeatingPlan(
        payload.id,
        payload.seatingPlanId,
      );
    } catch (error) {
      console.log(error);
    }
  }
}
