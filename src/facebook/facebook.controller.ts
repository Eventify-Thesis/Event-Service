import { Controller, Get, Post, Query, Res, UseGuards, Param, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { FacebookService } from './facebook.service';

import EventRoleGuard from '../auth/event-role/event-roles.guards';
import { EventRole } from '../auth/event-role/event-roles.enum';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import RequestWithUser from 'src/auth/role/requestWithUser.interface';

@Controller('auth/facebook')

export class FacebookAuthController {
  constructor(
    private readonly facebookService: FacebookService,
    private readonly configService: ConfigService,
  ) { }

  @Get()
  async facebookAuth(
    @Query('state') state: string,
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    const clientId = this.configService.get('FACEBOOK_APP_ID');
    const redirectUri = this.configService.get('FACEBOOK_REDIRECT_URI');
    const scope = 'pages_manage_posts,pages_read_engagement,pages_read_user_content, pages_manage_engagement, pages_manage_metadata';
    console.log(userId);
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}.${userId}&auth_type=rerequest`;
    res.redirect(authUrl);
  }

  @Get('callback')
  async facebookCallback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const eventId = state.split('.')[0];
    const userId = state.split('.')[1];
    if (error) {
      return res.redirect(`${this.configService.get('PLANNER_URL')}/events/${eventId}/marketing?success=false`);
    }

    try {
      console.log(userId);
      await this.facebookService.getAccessToken(code, userId);

      // Do NOT send accessToken/pages via query
      return res.redirect(`${this.configService.get('PLANNER_URL')}/events/${eventId}/marketing?success=true`);
    } catch (err) {
      console.error(err.message);
      return res.redirect(`${this.configService.get('PLANNER_URL')}/events/${eventId}/marketing?success=false`);
    }
  }

  @Get('check')
  async checkAuth(
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    const isAuthenticated = await this.facebookService.checkAuth(userId);
    return res.json({ isAuthenticated });
  }

  @Post('disconnect')
  async disconnect(
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    await this.facebookService.disconnect(userId);
    return res.json({ success: true });
  }
}

@Controller('planner/events/:eventId/marketing/facebook')
@UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
@UseGuards(ClerkAuthGuard)

export class FacebookController {
  constructor(private readonly facebookService: FacebookService) { }

  @Get('pages')
  async getPages(
    @Param('eventId') eventId: string,
    @Query('accessToken') accessToken: string,
  ) {
    return this.facebookService.getUserPages(accessToken);
  }

  @Get('posts')
  async getPosts(
    @Param('eventId') eventId: string,
    @Query('pageId') pageId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.facebookService.getPosts(pageId, req.user.id);
  }
}
