// planner-event.microservice.ts
import { Controller } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RedisContext,
} from '@nestjs/microservices';
import { PlannerEventService } from 'src/event/services/planner-event.service';

@Controller()
export class PlannerEventMicroservice {
  constructor(private readonly eventService: PlannerEventService) {}

  @MessagePattern('planner_event_list')
  async list(@Payload() data: { user: any; pagination: any; query: any }) {
    return await this.eventService.list(
      data.user.publicMetadata.organizations,
      data.pagination,
      data.query,
    );
  }
}
