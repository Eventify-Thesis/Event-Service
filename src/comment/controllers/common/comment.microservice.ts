import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommentService } from '../../comment.service';
import {
  CreateCommentDto,
  UpdateCommentDto,
} from '../../dto/create-comment.dto';

@Controller()
export class CommentMicroservice {
  constructor(private readonly commentService: CommentService) {}

  @MessagePattern('getComments')
  async getComments(@Payload() payload: { eventId: number; userId?: string }) {
    return await this.commentService.getCommentsByEventId(
      payload.eventId,
      payload.userId,
    );
  }

  @MessagePattern('createComment')
  async createComment(
    @Payload()
    payload: {
      eventId: number;
      userId: string;
      data: CreateCommentDto;
    },
  ) {
    return await this.commentService.createComment(
      payload.eventId,
      payload.userId,
      payload.data,
    );
  }

  @MessagePattern('updateComment')
  async updateComment(
    @Payload()
    payload: {
      commentId: number;
      userId: string;
      data: UpdateCommentDto;
    },
  ) {
    return await this.commentService.updateComment(
      payload.commentId,
      payload.userId,
      payload.data,
    );
  }

  @MessagePattern('deleteComment')
  async deleteComment(
    @Payload() payload: { commentId: number; userId: string },
  ) {
    return await this.commentService.deleteComment(
      payload.commentId,
      payload.userId,
    );
  }

  @MessagePattern('getComment')
  async getComment(@Payload() payload: { commentId: number; userId?: string }) {
    return await this.commentService.getCommentById(payload.commentId);
  }

  @MessagePattern('likeComment')
  async likeComment(@Payload() payload: { commentId: number; userId: string }) {
    return await this.commentService.likeComment(
      payload.commentId,
      payload.userId,
    );
  }
}
