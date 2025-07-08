import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { CommentLike } from './comment-like.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event_id' })
  eventId: number;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_edited', default: false })
  isEdited: boolean;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Event, (event) => event.comments)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parentComment: Comment;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  replies: Comment[];

  @OneToMany(() => CommentLike, (like) => like.comment)
  likes: CommentLike[];

  // User display fields (not stored in database, added dynamically)
  userFirstName?: string;
  userLastName?: string;
  userImageUrl?: string;

  // Like-related fields (added dynamically)
  isLikedByCurrentUser?: boolean;
}
