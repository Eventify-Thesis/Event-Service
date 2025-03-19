import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { AgeRestriction } from '../event.constant';
import { Event } from './event.entity';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Event, (event) => event.setting)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ length: 40 })
  url: string;

  @Column({ name: 'maximum_attendees' })
  maximumAttendees: number;

  @Column({
    type: 'enum',
    enum: AgeRestriction,
    name: 'age_restriction',
  })
  ageRestriction: AgeRestriction;

  @Column({ nullable: true, name: 'message_attendees' })
  messageAttendees: string;

  @Column({ default: true, name: 'is_private' })
  isPrivate: boolean;

  @Column({ type: 'text', nullable: true, name: 'event_description' })
  eventDescription: string;

  @Column({ default: false, name: 'is_refundable' })
  isRefundable: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
