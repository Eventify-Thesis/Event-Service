import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { TicketType } from '../../event/entities/ticket-type.entity';
import { CheckInList } from './check-in-list.entity';

@Entity('ticket_check_in_lists')
export class TicketCheckInList {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'ticket_type_id' })
    ticketTypeId: number;

    @ManyToOne(() => TicketType, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ticket_type_id' })
    ticketType: TicketType;

    @Column({ name: 'check_in_list_id' })
    checkInListId: number;

    @ManyToOne(() => CheckInList, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'check_in_list_id' })
    checkInList: CheckInList;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;
}
