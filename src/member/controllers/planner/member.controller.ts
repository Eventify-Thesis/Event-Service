import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { MemberService } from '../../services/member.service';
import {
  AddMemberDto,
  MemberListQuery,
  MemberListResponse,
  MemberResponse,
  UpdateMemberRoleDto,
} from '../../dto/member.dto';
import EventRoleGuard from 'src/auth/event-role/event-roles.guards';
import EventRole from 'src/auth/event-role/event-roles.enum';
import { EventExists } from 'src/event/pipes/event-exists.pipe';
import RequestWithUser from 'src/auth/role/requestWithUser.interface';
import { pagination } from 'src/common/decorators/pagination';
import {
  PaginationResponse,
  successResponse,
} from 'src/common/docs/response.doc';

@ApiTags('Planner Members')
@Controller('planner/events/:eventId/members')
@ApiBearerAuth()
export class PlannerMemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  @UseGuards(
    EventRoleGuard([EventRole.OWNER, EventRole.ADMIN, EventRole.MANAGER]),
  )
  @ApiOkResponse({ type: MemberResponse })
  async addMember(
    @Req() req: RequestWithUser,
    @Param('eventId', EventExists) eventId: number,
    @Body() dto: AddMemberDto,
  ) {
    return await this.memberService.addMember(req.user, eventId, {
      ...dto,
    });
  }

  @Delete(':userId')
  @UseGuards(
    EventRoleGuard([EventRole.OWNER, EventRole.ADMIN, EventRole.MANAGER]),
  )
  @ApiOkResponse(successResponse)
  async deleteMember(
    @Req() req: RequestWithUser,
    @Param('eventId', EventExists) eventId: number,
    @Param('userId') userId: string,
  ) {
    await this.memberService.deleteMember(req.user, eventId, userId);

    return {
      status: 'success',
    };
  }

  @Get()
  @UseGuards(
    EventRoleGuard([EventRole.OWNER, EventRole.ADMIN, EventRole.MANAGER]),
  )
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
                    $ref: getSchemaPath(MemberResponse),
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
    type: MemberListQuery,
  })
  async listMembers(
    @pagination() paramPagination,
    @Param('eventId', EventExists) eventId: number,
    @Query() query: MemberListQuery,
  ) {
    return await this.memberService.listMembers(eventId, {
      ...paramPagination,
      ...query,
    });
  }

  @Post(':userId/role')
  @UseGuards(
    EventRoleGuard([EventRole.OWNER, EventRole.ADMIN, EventRole.MANAGER]),
  )
  @ApiOkResponse(successResponse)
  async updateMemberRole(
    @Req() req: RequestWithUser,
    @Param('eventId', EventExists) eventId: number,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    const updatedMember = await this.memberService.updateMemberRole(
      req.user,
      eventId,
      userId,
      dto.role,
    );
    return {
      status: 'success',
    };
  }
}
