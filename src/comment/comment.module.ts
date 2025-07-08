import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../event/entities/comment.entity';
import { CommentLike } from '../event/entities/comment-like.entity';
import { CommentService } from './comment.service';
import { UserCommentController } from './controllers/user/comment.controller';
import { CommentMicroservice } from './controllers/common/comment.microservice';
import { ClerkClientProvider } from 'src/providers/clerk-client.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, CommentLike])],
  controllers: [UserCommentController, CommentMicroservice],
  providers: [CommentService, ClerkClientProvider],
  exports: [CommentService],
})
export class CommentModule {}
