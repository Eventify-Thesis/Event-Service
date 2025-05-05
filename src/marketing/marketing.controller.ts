import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { SchedulePostDto } from './dto/schedule-post.dto';
import { GeneratePostDto } from './dto/generate-post.dto';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import EventRoleGuard from 'src/auth/event-role/event-roles.guards';
import EventRole from 'src/auth/event-role/event-roles.enum';
import RequestWithUser from 'src/auth/role/requestWithUser.interface';

@Controller('planner/events/:eventId/marketing')
@UseGuards(ClerkAuthGuard)
@UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) { }

  @Post('generate')
  async generatePost(
    @Body() generatePostDto: GeneratePostDto
  ): Promise<string> {
    const content = await this.marketingService.generatePost(generatePostDto);
    return content;
  }

  @Get('facebook/pages')
  async getFacebookPages(
    @Req() req: RequestWithUser
  ) {
    return this.marketingService.getFacebookPages(req.user.id);
  }

  @Post('facebook/schedule')
  async schedulePost(
    @Param('eventId') eventId: string,
    @Req() req: RequestWithUser,
    @Body() schedulePostDto: SchedulePostDto,
  ) {
    return await this.marketingService.schedulePost(eventId, req.user.id, schedulePostDto);
  }
}
