import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Comment } from '../event/entities/comment.entity';
import { CommentLike } from '../event/entities/comment-like.entity';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';
import { ClerkClient } from '@clerk/backend';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
    @Inject('ClerkClient')
    private readonly clerkClient: ClerkClient,
  ) {}

  async getCommentsByEventId(
    eventId: number,
    userId?: string,
  ): Promise<Comment[]> {
    // Get all comments for the event (both root comments and replies)
    const allComments = await this.commentRepository.find({
      where: { eventId, isDeleted: false },
      order: { createdAt: 'ASC' }, // Older comments first for proper threading
    });

    // Enrich comments with user details
    let enrichedComments =
      await this.enrichCommentsWithUserDetails(allComments);

    // Enrich with like status if user is provided
    if (userId) {
      enrichedComments = await this.enrichCommentsWithLikeStatus(
        enrichedComments,
        userId,
      );
    }

    // Return flat structure - frontend will organize into hierarchy
    // Sort all comments: root comments newest first, replies oldest first
    return enrichedComments.sort((a, b) => {
      // If both are root comments, sort by newest first
      if (!a.parentId && !b.parentId) {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      // If both are replies, sort by oldest first (chronological order)
      if (a.parentId && b.parentId) {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      // Root comments come before replies
      return a.parentId ? 1 : -1;
    });
  }

  private async enrichCommentsWithUserDetails(
    comments: Comment[],
  ): Promise<Comment[]> {
    const uniqueUserIds = [
      ...new Set(comments.map((comment) => comment.userId)),
    ];
    const userDetailsMap = new Map<
      string,
      { firstName?: string; lastName?: string; imageUrl?: string }
    >();

    // Fetch user details for all unique user IDs
    const userPromises = uniqueUserIds.map(async (userId) => {
      try {
        const user = await this.clerkClient.users.getUser(userId);
        return {
          userId,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        };
      } catch (error) {
        console.error(`Failed to fetch user details for ${userId}:`, error);
        return {
          userId,
          firstName: null,
          lastName: null,
          imageUrl: null,
        };
      }
    });

    const userDetails = await Promise.all(userPromises);

    // Create a map for quick lookup
    userDetails.forEach((user) => {
      userDetailsMap.set(user.userId, {
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      });
    });

    // Enrich comments with user details
    return comments.map((comment) => {
      const userInfo = userDetailsMap.get(comment.userId);
      return {
        ...comment,
        userFirstName: userInfo?.firstName,
        userLastName: userInfo?.lastName,
        userImageUrl: userInfo?.imageUrl,
      };
    });
  }

  async createComment(
    eventId: number,
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      eventId,
      userId,
      content: createCommentDto.content,
      parentId: createCommentDto.parentId,
    });

    return this.commentRepository.save(comment);
  }

  async updateComment(
    commentId: number,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, isDeleted: false },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = updateCommentDto.content;
    comment.isEdited = true;

    return this.commentRepository.save(comment);
  }

  async deleteComment(commentId: number, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, isDeleted: false },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    comment.isDeleted = true;
    await this.commentRepository.save(comment);
  }

  async getCommentById(commentId: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, isDeleted: false },
      relations: ['replies'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async likeComment(commentId: number, userId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, isDeleted: false },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user already liked this comment
    const existingLike = await this.commentLikeRepository.findOne({
      where: { commentId, userId },
    });

    if (existingLike) {
      // User already liked, so unlike
      await this.commentLikeRepository.remove(existingLike);
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    } else {
      // Create new like
      const like = this.commentLikeRepository.create({
        commentId,
        userId,
      });
      await this.commentLikeRepository.save(like);
      comment.likeCount = comment.likeCount + 1;
    }

    return this.commentRepository.save(comment);
  }

  async getCommentLikeStatus(
    commentId: number,
    userId: string,
  ): Promise<boolean> {
    const like = await this.commentLikeRepository.findOne({
      where: { commentId, userId },
    });
    return !!like;
  }

  async enrichCommentsWithLikeStatus(
    comments: Comment[],
    userId: string,
  ): Promise<Comment[]> {
    const commentIds = comments.map((comment) => comment.id);

    // If no comments, return them as-is
    if (commentIds.length === 0) {
      return comments;
    }

    const userLikes = await this.commentLikeRepository.find({
      where: { commentId: In(commentIds), userId },
    });

    const likedCommentIds = new Set(userLikes.map((like) => like.commentId));

    return comments.map((comment) => ({
      ...comment,
      isLikedByCurrentUser: likedCommentIds.has(comment.id),
    }));
  }
}
