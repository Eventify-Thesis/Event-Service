import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { EventStatus, EventType } from '../event.constant';
import { PaymentInfo } from './payment-info.entity';
import { Setting } from './setting.entity';
import { Show } from './show.entity';
import { Question } from '../../question/entities/question.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'event_name' })
  eventName: string;

  @OneToOne(() => Setting, (setting) => setting.event)
  setting: Setting;

  @OneToOne(() => PaymentInfo, (paymentInfo) => paymentInfo.event)
  paymentInfo: PaymentInfo;

  @OneToMany(() => Show, (show) => show.event)
  shows: Show[];

  @OneToMany(() => Question, (question) => question.event)
  questions: Question[];

  @Column({ nullable: true, name: 'event_description' })
  eventDescription: string;

  @Column({
    type: 'enum',
    enum: EventType,
    name: 'event_type',
  })
  eventType: EventType;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
    name: 'status',
  })
  status: EventStatus;

  @Column({ name: 'org_name' })
  orgName: string;

  @Column({ name: 'org_description' })
  orgDescription: string;

  @Column({ name: 'org_logo_url' })
  orgLogoUrl: string;

  @Column({ name: 'event_logo_url' })
  eventLogoUrl: string;

  @Column({ name: 'event_banner_url' })
  eventBannerUrl: string;

  @Column({ nullable: true, name: 'venue_name' })
  venueName: string;

  @Column({ nullable: true, name: 'city_id' })
  cityId: number;

  @Column({ nullable: true, name: 'district_id' })
  districtId: number;

  @Column({ nullable: true, name: 'ward_id' })
  wardId: number;

  @Column({ nullable: true })
  street: string;

  @Column('text', { array: true, name: 'categories' })
  categories: string[];

  @Column('text', { array: true, name: 'categories_ids' })
  categoriesIds: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
