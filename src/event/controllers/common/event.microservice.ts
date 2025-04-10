// planner-event.microservice.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventService } from 'src/event/services/event.service';

@Controller()
export class EventMicroservice {
  constructor(private readonly eventService: EventService) {}

  @MessagePattern('getEventDetails')
  async getEventDetails(@Payload() id: string) {
    return await this.eventService.findOne(id);
  }
}
