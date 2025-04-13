import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { SeatingPlan } from './seating-plan.entity';
import { Show } from '../../event/entities/show.entity';
import { TicketType } from '../../event/entities/ticket-type.entity';
import { Event } from '../../event/entities/event.entity';

@Entity({ name: 'seat_category_mappings' })
export class SeatCategoryMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'seating_plan_id' })
  seatingPlanId: number;

  @Column({ name: 'event_id' })
  eventId: number;

  @Column({ name: 'show_id' })
  showId: number;

  @Column()
  category: string;

  @Column({ name: 'ticket_type_id' })
  ticketTypeId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships

  @ManyToOne(
    () => SeatingPlan,
    (seatingPlan) => seatingPlan.seatCategoryMappings,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'seating_plan_id' })
  seatingPlan: SeatingPlan;

  @ManyToOne(() => Event, (event) => event.seatCategoryMappings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => Show, (show) => show.seatCategoryMapping, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'show_id' })
  show: Show;

  @OneToOne(() => TicketType, (ticketType) => ticketType.seatCategoryMapping)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketType;
}
