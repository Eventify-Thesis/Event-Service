import { Event } from "../../event/entities/event.entity";
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

export enum MessageStatus {
    PENDING = 'PENDING',
    SENT = 'SENT',
    FAILED = 'FAILED'
}

@Entity("messages")
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Event, (event) => event.messages)
    @JoinColumn({ name: "event_id" })
    event: Event;

    @Column({ name: 'event_id' })
    eventId: string;

    @Column({ name: 'subject' })
    subject: string;

    @Column({ name: 'message' })
    message: string;

    @Column({ name: 'type' })
    type: string;

    @Column({ name: 'recipient_ids' })
    recipientIds: string;

    @Column({ name: 'sent_at' })
    sentAt: Date;

    @Column({ name: 'sent_by_user_id' })
    sentByUserId: string;

    @Column({ name: 'attendee_ids' })
    attendeeIds: string;

    @Column({ name: 'ticket_type_ids' })
    ticketTypeIds: string;

    @Column({ name: 'order_id' })
    orderId: number;

    @Column({ name: 'status', type: 'enum', enum: MessageStatus, default: MessageStatus.PENDING })
    status: MessageStatus;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    @DeleteDateColumn({ name: "deleted_at" })
    deletedAt: Date;
}