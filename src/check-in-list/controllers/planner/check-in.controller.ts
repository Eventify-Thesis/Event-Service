import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Ip,
} from '@nestjs/common';
import { CheckInService } from '../../services/check-in.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseIntPipe } from '@nestjs/common';
import { CheckInAttendeeQuery } from 'src/check-in-list/dto/check-in-list.dto';

@ApiTags('Check-in')
@Controller('planner/events/:eventId/check-in')
export class PlannerCheckInController {
  constructor(private readonly checkInService: CheckInService) { }

  @Get(':checkInListShortId')
  @ApiOperation({ summary: 'Get check-in list details' })
  async getCheckInList(
    @Param('eventId') eventId: number,
    @Param('checkInListShortId') checkInListShortId: string,
  ) {
    const data = await this.checkInService.getCheckInList(
      eventId,
      checkInListShortId,
    );
    return { data };
  }

  @Get(':checkInListShortId/attendees')
  @ApiOperation({ summary: 'Get check-in list attendees' })
  async getCheckInListAttendees(
    @Param('eventId') eventId: number,
    @Param('checkInListShortId') checkInListShortId: string,
    @Query() query: CheckInAttendeeQuery,
  ) {
    const checkInList = await this.checkInService.getCheckInList(
      eventId,
      checkInListShortId,
    );

    return await this.checkInService.getCheckInListAttendees(
      eventId,
      checkInList.id,
      query,
    );
  }

  @Post(':checkInListShortId/check-ins')
  @ApiOperation({ summary: 'Create check-in' })
  async createCheckIn(
    @Param('eventId') eventId: number,
    @Param('checkInListShortId') checkInListShortId: string,
    @Body() body: { attendee_public_ids: string[] },
    @Ip() ip: string,
  ) {
    return await this.checkInService.createCheckIn(
      eventId,
      checkInListShortId,
      body.attendee_public_ids,
      ip,
    );
  }

  @Delete(':checkInListShortId/check-ins/:checkInShortId')
  @ApiOperation({ summary: 'Delete check-in' })
  async deleteCheckIn(
    @Param('eventId') eventId: number,
    @Param('checkInListShortId') checkInListShortId: string,
    @Param('checkInShortId') checkInShortId: string,
  ) {
    return await this.checkInService.deleteCheckIn(
      eventId,
      checkInListShortId,
      checkInShortId,
    );
  }
}
