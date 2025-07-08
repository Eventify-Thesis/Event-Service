import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum IssueCategory {
  BUG = 'bug',
  TRANSACTION = 'transaction',
  UI_UX = 'ui_ux',
  FEATURE_REQUEST = 'feature_request',
  ACCOUNT = 'account',
  OTHER = 'other',
}

export enum IssueStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum IssuePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('issue_reports')
export class IssueReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', length: 255 })
  userId: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: IssueCategory,
    default: IssueCategory.OTHER,
  })
  category: IssueCategory;

  @Column({
    type: 'enum',
    enum: IssueStatus,
    default: IssueStatus.OPEN,
  })
  status: IssueStatus;

  @Column({
    type: 'enum',
    enum: IssuePriority,
    default: IssuePriority.MEDIUM,
  })
  priority: IssuePriority;

  @Column({ name: 'image_urls', type: 'text', array: true, default: [] })
  imageUrls: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
