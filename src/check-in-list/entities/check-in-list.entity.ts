import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { Show } from '../../event/entities/show.entity';
import { TicketType } from '../../event/entities/ticket-type.entity';

@Entity('check_in_lists')
export class CheckInList {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'short_id', length: 255 })
    shortId: string;

    @Column({ length: 100 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
    expiresAt?: Date;

    @Column({ name: 'activates_at', type: 'timestamp', nullable: true })
    activatesAt?: Date;

    @Column({ name: 'event_id' })
    eventId: number;

    @ManyToOne(() => Event, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'event_id' })
    event?: Event;

    @Column({ name: 'show_id' })
    showId: number;

    @ManyToOne(() => Show, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'show_id' })
    show?: Show;

    @ManyToMany(() => TicketType)
    @JoinTable({
        name: 'ticket_check_in_lists',
        joinColumn: {
            name: 'check_in_list_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'ticket_type_id',
            referencedColumnName: 'id',
        },
    })
    ticketTypes: TicketType[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;
}
