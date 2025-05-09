import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ValidationPipe,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { ShowScheduleService } from '../../show-schedule.service';
import { CreateShowScheduleDto } from '../../dto/create-show-schedule.dto';
import { UpdateShowScheduleDto } from '../../dto/update-show-schedule.dto';
import { EventExists } from 'src/event/pipes/event-exists.pipe';

@Controller('planner/events/:eventId/show-schedules')
export class PlannerShowScheduleController {
  constructor(private readonly showScheduleService: ShowScheduleService) { }

  @Post('shows/:showId')
  async create(
    @Param('eventId', EventExists) eventId: number,
    @Param('showId', ParseIntPipe) showId: number,
    @Body(ValidationPipe) createShowScheduleDto: CreateShowScheduleDto,
  ) {
    createShowScheduleDto.showId = showId;
    createShowScheduleDto.eventId = eventId;
    return this.showScheduleService.create(createShowScheduleDto);
  }

  @Get('list')
  async findAll(@Param('eventId', EventExists) eventId: number) {
    return this.showScheduleService.findAll(eventId);
  }

  @Get('shows/:showId')
  async findAllByShow(@Param('showId', ParseIntPipe) showId: number) {
    return this.showScheduleService.findAllByShow(showId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.showScheduleService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateShowScheduleDto: UpdateShowScheduleDto,
  ) {
    return this.showScheduleService.update(id, updateShowScheduleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.showScheduleService.remove(id);
  }
}
