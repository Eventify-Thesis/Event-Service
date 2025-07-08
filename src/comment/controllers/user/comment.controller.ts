import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentService } from '../../comment.service';
import {
  CreateCommentDto,
  UpdateCommentDto,
} from '../../dto/create-comment.dto';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { EventExists } from 'src/event/pipes/event-exists.pipe';
import RequestWithUser from 'src/auth/role/requestWithUser.interface';

@Controller('user/events/:eventId/comments')
@UseGuards(ClerkAuthGuard)
export class UserCommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  async getComments(
    @Req() req: RequestWithUser,
    @Param('eventId', EventExists) eventId: string,
  ) {
    return this.commentService.getCommentsByEventId(
      parseInt(eventId),
      req.user.id,
    );
  }

  @Post()
  async createComment(
    @Req() req: RequestWithUser,
    @Param('eventId', EventExists) eventId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.createComment(
      parseInt(eventId),
      req.user.id,
      createCommentDto,
    );
  }

  @Put(':commentId')
  async updateComment(
    @Req() req: RequestWithUser,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(
      commentId,
      req.user.id,
      updateCommentDto,
    );
  }

  @Delete(':commentId')
  async deleteComment(
    @Req() req: RequestWithUser,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.commentService.deleteComment(commentId, req.user.id);
  }

  @Get(':commentId')
  async getComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentService.getCommentById(commentId);
  }

  @Post(':commentId/like')
  async likeComment(
    @Req() req: RequestWithUser,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.commentService.likeComment(commentId, req.user.id);
  }
}
