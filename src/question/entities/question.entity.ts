import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QuestionType, QuestionBelongsTo } from '../enums/question-type.enum';
import { Event } from '../../event/entities/event.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, (event) => event.questions)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: QuestionType })
  type: QuestionType;

  @Column({ default: false })
  required: boolean;

  @Column({ type: 'json', nullable: true })
  options: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true, name: 'sort_order' })
  sortOrder: number;

  @Column({
    type: 'enum',
    enum: QuestionBelongsTo,
    nullable: true,
    name: 'belongs_to',
  })
  belongsTo: QuestionBelongsTo;

  @Column({ default: false, name: 'is_hidden' })
  isHidden: boolean;

  @Column({ type: 'json', nullable: true, name: 'ticket_type_ids' })
  ticketTypeIds: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  isMultipleChoice(): boolean {
    return [QuestionType.MULTI_SELECT_DROPDOWN, QuestionType.CHECKBOX].includes(
      this.type,
    );
  }
}
