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
import { SeatCategoryMapping } from 'src/seating-plan/entities/seat-category-mapping.entity';

@Entity('shows')
export class Show {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  endTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => TicketType, (ticketType) => ticketType.show)
  @JoinColumn({ name: 'show_id' })
  ticketTypes: TicketType[];

  @OneToOne(
    () => SeatCategoryMapping,
    (seatCategoryMapping) => seatCategoryMapping.show,
  )
  seatCategoryMapping: SeatCategoryMapping;
}
