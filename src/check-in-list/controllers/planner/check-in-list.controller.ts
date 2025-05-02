import { Controller, Get, Post, Put, Body, Param, Delete, Query } from '@nestjs/common';
import { CheckInListService } from '../../check-in-list.service';
import { CreateCheckInListDto } from '../../dto/create-check-in-list.dto';
import { UpdateCheckInListDto } from '../../dto/update-check-in-list.dto';
import { CheckInListQuery } from 'src/check-in-list/dto/check-in-list.dto';
import { EventExists } from 'src/event/pipes/event-exists.pipe';
import { CheckInListListQuery } from 'src/check-in-list/dto/check-in-list-list.query';

@Controller('planner/events/:eventId/check-in-lists')
export class PlannerCheckInListController {
  constructor(private readonly checkInListService: CheckInListService) { }

  @Post()
  create(
    @Param('eventId', EventExists) eventId: number,
    @Body() createCheckInListDto: CreateCheckInListDto
  ) {
    return this.checkInListService.create(eventId, createCheckInListDto);
  }

  @Get()
  findAll(
    @Param('eventId', EventExists) eventId: number,
    @Query() query: CheckInListListQuery
  ) {
    return this.checkInListService.findAll({
      ...query,
      eventId
    });
  }

  @Get(':id')
  findOne(
    @Param('eventId', EventExists) eventId: number,
    @Param('id') id: number
  ) {
    return this.checkInListService.findOne(eventId, id);
  }

  @Put(':id')
  update(
    @Param('eventId', EventExists) eventId: number,
    @Param('id') id: number,
    @Body() updateCheckInListDto: UpdateCheckInListDto
  ) {
    return this.checkInListService.update(eventId, id, updateCheckInListDto);
  }

  @Delete(':id')
  remove(
    @Param('eventId', EventExists) eventId: number,
    @Param('id') id: number
  ) {
    return this.checkInListService.remove(eventId, id);
  }
}
