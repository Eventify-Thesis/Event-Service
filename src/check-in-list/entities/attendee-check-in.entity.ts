import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { Show } from '../../event/entities/show.entity';
import { TicketType } from '../../event/entities/ticket-type.entity';
import { CheckInList } from './check-in-list.entity';

@Entity('attendee_check_ins')
export class AttendeeCheckIn {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'short_id', length: 255 })
    shortId: string;

    @Column({ name: 'check_in_list_id' })
    checkInListId: number;

    @ManyToOne(() => CheckInList, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'check_in_list_id' })
    checkInList: CheckInList;

    @Column({ name: 'ticket_type_id' })
    ticketTypeId: number;

    @ManyToOne(() => TicketType, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ticket_type_id' })
    ticketType: TicketType;

    @Column({ name: 'show_id' })
    showId: number;

    @ManyToOne(() => Show, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'show_id' })
    show: Show;

    @Column({ name: 'attendee_id' })
    attendeeId: number;

    @Column({ name: 'ip_address', type: 'inet' })
    ipAddress: string;

    @Column({ name: 'event_id' })
    eventId: number;

    @ManyToOne(() => Event, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'event_id' })
    event: Event;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;
}
