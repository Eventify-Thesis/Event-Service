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
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import {
  PaginationResponse,
  successResponse,
} from 'src/common/docs/response.doc';
import { CreateDraftEventDto } from 'src/event/dto/create-draft-event.dto';
import { UpdateEventSettingDto } from 'src/event/dto/update-event-setting.dto';
import { PlannerEventService } from 'src/event/services/planner-event.service';
import { EventBodyExists } from 'src/event/pipes/event-body-exists.pipe';
import { EventExists } from 'src/event/pipes/event-exists.pipe';
import EventRole from 'src/auth/event-role/event-roles.enum';
import EventRoleGuard from 'src/auth/event-role/event-roles.guards';
import RequestWithUser from 'src/auth/role/requestWithUser.interface';
import { UpdateEventPaymentInfoDto } from 'src/event/dto/update-event-payment-info.dto';
import { UpdateEventShowDto } from 'src/event/dto/update-event-show.dto';
import { pagination } from 'src/common/decorators/pagination';
import {
  EventBriefResponse,
  EventListAllQuery,
  EventListAllResponse,
} from 'src/event/dto/event-doc.dto';
import { EventStatsService } from '../../services/event-stats.service';
import { EventStatsResponseDto } from 'src/event/dto/event-stats.dto';

@Controller({
  path: 'planner/events',
})
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
export class PlannerEventController {
  constructor(
    private readonly eventService: PlannerEventService,
    private readonly eventStatsService: EventStatsService,
  ) { }

  @Get('')
  @ApiOkResponse({
    schema: {
      properties: {
        data: {
          allOf: [
            { $ref: getSchemaPath(PaginationResponse) },
            {
              properties: {
                docs: {
                  type: 'array',
                  items: {
                    $ref: getSchemaPath(EventListAllResponse),
                  },
                },
              },
            },
          ],
        },
      },
    },
  })
  @ApiQuery({
    type: EventListAllQuery,
  })
  async list(
    @pagination() paramPagination,
    @Query() query,
    @Req() req: RequestWithUser,
  ) {
    return await this.eventService.list(
      req.user.publicMetadata.organizations,
      paramPagination,
      query,
    );
  }

  @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
  @Get(':eventId/brief')
  @ApiOkResponse({
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(EventBriefResponse),
        },
      },
    },
  })
  async getBrief(
    @Param('eventId', EventExists) eventId: number,
    @Req() req: RequestWithUser,
  ) {
    return await this.eventService.getBrief(req.user, eventId);
  }

  @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
  @Post('draft')
  async upsert(
    @Body(EventBodyExists) createDraftEventDto: CreateDraftEventDto,
    @Req() req: RequestWithUser,
  ) {
    return await this.eventService.upsert(req.user, createDraftEventDto);
  }

  @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
  @Put(':eventId/settings')
  @ApiBody({
    required: true,
    type: UpdateEventSettingDto,
  })
  @ApiOkResponse(successResponse)
  async updateSetting(
    @Body() updateEventSettingDto: UpdateEventSettingDto,
    @Param('eventId', EventExists) eventId: number,
  ) {
    await this.eventService.updateSetting(eventId, updateEventSettingDto);
    return {
      status: 'success',
    };
  }

  @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
  @Put(':eventId/payment-info')
  @ApiBody({
    required: true,
    type: UpdateEventPaymentInfoDto,
  })
  @ApiOkResponse(successResponse)
  async updatePaymentInfo(
    @Body() updatePaymentInfoDto: UpdateEventPaymentInfoDto,
    @Param('eventId', EventExists) eventId: number,
  ) {
    await this.eventService.updatePaymentInfo(eventId, updatePaymentInfoDto);
    return {
      status: 'success',
    };
  }

  @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
  @Put(':eventId/shows')
  @ApiBody({
    required: true,
    type: UpdateEventShowDto,
  })
  @ApiOkResponse(successResponse)
  async updateShow(
    @Body() updateShowDto: UpdateEventShowDto,
    @Param('eventId', EventExists) eventId: number,
  ) {
    await this.eventService.updateShows(eventId, updateShowDto);
    return {
      status: 'success',
    };
  }

  @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
  @Get(':eventId')
  async findOne(@Param('eventId', EventExists) eventId: number) {
    return await this.eventService.findOne(eventId);
  }

  @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
  @Get(':eventId/settings')
  async findSettings(@Param('eventId', EventExists) eventId: number) {
    return await this.eventService.findSettings(eventId);
  }

  @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
  @Get(':eventId/payment-info')
  async findPaymentInfo(@Param('eventId', EventExists) eventId: number) {
    return await this.eventService.findPaymentInfo(eventId);
  }

  @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
  @ApiOkResponse()
  @Get(':eventId/shows')
  async findShows(@Param('eventId', EventExists) eventId: number) {
    return await this.eventService.findShows(eventId);
  }

  @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
  @ApiOkResponse()
  @Get(':eventId/ticket-types')
  async findTickets(@Param('eventId', EventExists) eventId: number) {
    return await this.eventService.findTicketTypes(eventId);
  }

  @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
  @ApiOkResponse()
  @Get(':eventId/shows/:showId/ticket-types')
  async findTicketTypesOfShow(
    @Param('eventId', EventExists) eventId: number,
    @Param('showId') showId: number,
  ) {
    return await this.eventService.findTicketTypesOfShow(eventId, showId);
  }

  @UseGuards(EventRoleGuard(EventRole.OWNER))
  @ApiOkResponse(successResponse)
  @Delete(':eventId')
  async remove(@Param('eventId', EventExists) eventId: number) {
    await this.eventService.remove(eventId);
    return {
      status: 'success',
    };
  }

  @UseGuards(EventRoleGuard(EventRole.OWNER))
  @ApiOkResponse({ type: EventStatsResponseDto })
  @Get(':eventId/stats')
  async getStats(@Param('eventId', EventExists) eventId: number) {
    return await this.eventStatsService.getEventStats(eventId);
  }
}
