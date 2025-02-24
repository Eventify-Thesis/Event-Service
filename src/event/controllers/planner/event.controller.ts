import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { successResponse } from 'src/common/docs/response.doc';
import { CreateDraftEventDto } from 'src/event/dto/create-draft-event.dto';
import { UpdateEventSettingDto } from 'src/event/dto/update-event-setting.dto';
import { PlannerEventService } from 'src/event/services/planner-event.service';
import { EventBodyExists } from 'src/event/pipes/event-body-exists.pipe';
import { EventExists } from 'src/event/pipes/event-exists.pipe';
import EventRole from 'src/auth/event-role/event-roles.enum';
import EventRoleGuard from 'src/auth/event-role/event-roles.guards';
import RequestWithUser from 'src/auth/role/requestWithUser.interface';
import RequestWithUserAndOrganizations from 'src/auth/event-role/requestWithUserAndOrganizations.interface';
import { UpdateEventPaymentInfoDto } from 'src/event/dto/update-event-payment-info.dto';
import { UpdateEventShowDto } from 'src/event/dto/update-event-show.dto';

@Controller({
  path: 'planner/events',
})
@UseGuards(ClerkAuthGuard)
export class PlannerEventController {
  constructor(private readonly eventService: PlannerEventService) {}

  @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
  @Post('draft')
  async upsert(
    @Body(EventBodyExists) createDraftEventDto: CreateDraftEventDto,
    @Req() req: RequestWithUserAndOrganizations,
  ) {
    return await this.eventService.upsert(req.user.user.id, createDraftEventDto);
  }

  @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
  @Put(':eventId/settings')
  @ApiOkResponse(successResponse)
  async updateSetting(
    @Body() updateEventSettingDto: UpdateEventSettingDto,
    @Param('eventId', EventExists) eventId: string,
  ) {
    await this.eventService.updateSetting(eventId, updateEventSettingDto);
    return {
      status: 'success',
    };
  }

  
  @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
  @Put(':eventId/payment-info')
  @ApiOkResponse(successResponse)
  async updatePaymentInfo(
    @Body() updatePaymentInfoDto: UpdateEventPaymentInfoDto,
    @Param('eventId', EventExists) eventId: string,
  ) {
    await this.eventService.updatePaymentInfo(eventId, updatePaymentInfoDto);
    return {
      status: 'success',
    };
  }

  
  @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
  @Put(':eventId/shows')
  @ApiOkResponse(successResponse)
  async updateShow(
    @Body() updateShowDto: UpdateEventShowDto,
    @Param('eventId', EventExists) eventId: string,
  ) {
    await this.eventService.updateShow(eventId, updateShowDto);
    return {
      status: 'success',
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
  //   return this.eventService.update(+id, updateEventDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove(+id);
  }
}
