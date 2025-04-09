import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Event } from './event.entity';
import { TicketType } from './ticket-type.entity';
import { SeatCategoryMapping } from '../../seating-plan/entities/seat-category-mapping.entity';
import { SeatingPlan } from '../../seating-plan/entities/seating-plan.entity';

@Entity('shows')
export class Show {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  endTime: Date;

  @Column({ name: 'seating_plan_id', type: 'uuid', nullable: true })
  seatingPlanId: string;

  @Column({ name: 'locked', type: 'boolean', default: false })
  locked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => TicketType, (ticketType) => ticketType.show)
  ticketTypes: TicketType[];

  @OneToOne(
    () => SeatCategoryMapping,
    (seatCategoryMapping) => seatCategoryMapping.show,
  )
  seatCategoryMapping: SeatCategoryMapping;

  @ManyToOne(() => SeatingPlan, { nullable: true })
  @JoinColumn({ name: 'seating_plan_id' })
  seatingPlan: SeatingPlan;
}
