import { Controller, Get, Param } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { EventDetailResponse } from 'src/event/dto/event-doc.dto';
import { EventExists } from 'src/event/pipes/event-exists.pipe';
import { EventService } from 'src/event/services/event.service';

@Controller('events/')
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @Get(':id')
  @ApiResponse({ type: EventDetailResponse })
  findOne(@Param('id', EventExists) id: string) {
    return this.eventService.findOne(+id);
  }
}
