import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Show } from './show.entity';
import { Event } from './event.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Show)
  @JoinColumn({ name: 'show_id' })
  show: Show;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'show_id' })
  showId: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: false, name: 'is_free' })
  isFree: boolean;

  @Column()
  quantity: number;

  @Column({ name: 'min_ticket_purchase' })
  minTicketPurchase: number;

  @Column({ name: 'max_ticket_purchase' })
  maxTicketPurchase: number;

  @Column({ type: 'timestamp', name: 'start_time' })
  startTime: Date;

  @Column({ type: 'timestamp', name: 'end_time' })
  endTime: Date;

  @Column('text')
  description: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ default: false, name: 'is_hidden' })
  isHidden: boolean;

  @Column({ default: 0, name: 'sold_quantity' })
  soldQuantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
