import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Comment } from './comment.entity';

@Entity('comment_likes')
@Unique(['commentId', 'userId'])
export class CommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'comment_id' })
  commentId: number;

  @Column({ name: 'user_id' })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Comment, (comment) => comment.likes)
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;
}
