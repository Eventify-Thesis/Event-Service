import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { MessageService } from '../../message.service';
import { CreateMessageDto } from '../../dto/create-message.dto';
import EventRoleGuard from 'src/auth/event-role/event-roles.guards';
import EventRole from 'src/auth/event-role/event-roles.enum';
import { EventExists } from 'src/event/pipes/event-exists.pipe';
import RequestWithUser from 'src/auth/role/requestWithUser.interface';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';

@Controller('planner/events/:eventId/messages')
@UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
@UseGuards(ClerkAuthGuard)
export class PlannerMessageController {
  constructor(private readonly messageService: MessageService) { }

  @Post()
  async sendMessage(
    @Req() req: RequestWithUser,
    @Param('eventId', EventExists) eventId: string,
    @Body() createMessageDto: CreateMessageDto
  ) {
    return this.messageService.create({
      ...createMessageDto,
      eventId,
      sentByUserId: req.user.id,
    });
  }
}
