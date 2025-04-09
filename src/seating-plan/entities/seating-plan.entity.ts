import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { SeatCategoryMapping } from './seat-category-mapping.entity';
import { Show } from '../../event/entities/show.entity';
import { Seat } from './seat.entity';

@Entity('seating_plans')
export class SeatingPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'jsonb' })
  plan: any;

  @Column({ default: false })
  locked: boolean;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Show, (show) => show.seatingPlan)
  shows: Show[];

  @OneToMany(
    () => SeatCategoryMapping,
    (seatCategoryMapping) => seatCategoryMapping.seatingPlan,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'seating_plan_id' })
  seatCategoryMappings: SeatCategoryMapping[];

  @OneToMany(() => Seat, (seat) => seat.seatingPlan)
  seats: Seat[];
}
