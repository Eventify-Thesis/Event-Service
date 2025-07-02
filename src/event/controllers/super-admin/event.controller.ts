import { Controller, Get, Param, Put, Body, Query, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, getSchemaPath, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SuperAdminEventService } from 'src/event/services/superadmin-event.service';
import { EventStatus, MESSAGE } from 'src/event/event.constant';
import { AppException } from 'src/common/exceptions/app.exception';
import EventRole from 'src/auth/event-role/event-roles.enum';
import EventRoleGuard from 'src/auth/event-role/event-roles.guards';
import { EventListAllQuery, EventListAllResponse, EventDetailResponse } from 'src/event/dto/event-doc.dto';
import { PaginationResponse } from 'src/common/docs/response.doc';
import { PaginatedResponse } from 'src/common/docs/pagination-swagger.decorator';
import { EventExists } from 'src/event/pipes/event-exists.pipe';
import { pagination } from 'src/common/decorators/pagination';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';

@Controller({ path: 'superadmin/events' })    
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
export class SuperAdminEventController {
    constructor(private readonly SuperAdminEventService: SuperAdminEventService) {}
    
    @Get('')
    @PaginatedResponse(EventListAllResponse)
    @ApiQuery({
        type: EventListAllQuery,
    })
    @ApiOperation({ summary: 'Get list of all events' })
    async listAllEvents(
        @pagination() paramPagination,
        @Query() query: EventListAllQuery) {

        // Fake organizations map with full access for superadmin
        const fakeOrg = {
        '*': 'superadmin:owner',
        };

        return await this.SuperAdminEventService.list(fakeOrg, paramPagination, query);
    }

    
  //can chinh lai role tuong ung
    @Get(':id')
    async getEventDetail(@Param('id', EventExists) eventId: number) {
        return await this.SuperAdminEventService.findOne(eventId);
    }
    
    @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
      @ApiOkResponse()
      @Get(':eventId/shows')
      async findShows(@Param('eventId', EventExists) eventId: number) {
        return await this.SuperAdminEventService.findShows(eventId);
      }

    @UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
    @Put(':id/censor')
    @ApiOperation({ summary: 'Censor an event (approve/decline)' })
    async censorEvent(
        @Param('id') eventId: number,
        @Body() body: { status: EventStatus; currentStatus: EventStatus},
    ) {
        return await this.SuperAdminEventService.censorEvent(eventId, body.status, body.currentStatus);
    }
    
    //@UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
    @Delete(':id')
    @ApiOperation({ summary: 'Delete an event' })
    async deleteEvent(@Param('id', EventExists) eventId: number) {
        return await this.SuperAdminEventService.deleteEvent(eventId);
    }
}
