// planner-event.microservice.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventService } from 'src/event/services/event.service';

@Controller()
export class EventMicroservice {
  constructor(private readonly eventService: EventService) {}

  @MessagePattern('getEventDetails')
  async getEventDetails(@Payload() id: number) {
    return await this.eventService.findOne(id);
  }

  @MessagePattern('getEventShowDetails')
  async getEventShowDetails(
    @Payload() payload: { id: number; showId: number },
  ) {
    return await this.eventService.getEventShowDetails(
      payload.id,
      payload.showId,
    );
  }
}
