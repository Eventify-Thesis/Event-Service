import { ApiProperty } from '@nestjs/swagger';
import { Event } from '../../event/entities/event.entity';
import { Show } from '../../event/entities/show.entity';
import { TicketType } from '../../event/entities/ticket-type.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { SeatingPlan } from './seating-plan.entity';

export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
}

@Entity('seats')
export class Seat {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @ApiProperty()
  @Column({ name: 'seating_plan_id' })
  seatingPlanId: number;

  @ApiProperty()
  @Column({ name: 'event_id' })
  eventId: number;

  @ApiProperty()
  @Column({ name: 'show_id' })
  showId: number;

  @ApiProperty()
  @Column({ name: 'zone_id', nullable: true })
  zoneId: string;

  @ApiProperty()
  @Column({ name: 'row_label', nullable: true })
  rowLabel: string;

  @ApiProperty()
  @Column({ name: 'seat_number', nullable: true })
  seatNumber: string;

  @ApiProperty()
  @Column({ name: 'ticket_type_id' })
  ticketTypeId: number;

  @ApiProperty({ enum: SeatStatus })
  @Column({
    type: 'enum',
    enum: SeatStatus,
    default: SeatStatus.AVAILABLE,
  })
  status: SeatStatus;

  @ManyToOne(() => SeatingPlan, (seatingPlan) => seatingPlan.seats)
  @JoinColumn({ name: 'seating_plan_id' })
  seatingPlan: SeatingPlan;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => Show)
  @JoinColumn({ name: 'show_id' })
  show: Show;

  @ManyToOne(() => TicketType)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketType;
}
