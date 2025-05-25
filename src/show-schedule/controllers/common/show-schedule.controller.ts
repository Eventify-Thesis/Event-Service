import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ShowScheduleService } from '../../show-schedule.service';
import { EventExists } from 'src/event/pipes/event-exists.pipe';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';

@Controller('events/:eventId/show-schedules')
@UseGuards(ClerkAuthGuard)
export class CommonShowScheduleController {
  constructor(private readonly showScheduleService: ShowScheduleService) {}

  @Get('list')
  async findAll(@Param('eventId', EventExists) eventId: number) {
    return this.showScheduleService.findAll(eventId);
  }

  @Get('shows/:showId')
  async findAllByShow(@Param('showId', ParseIntPipe) showId: number) {
    return this.showScheduleService.findAllByShow(showId);
  }
}
