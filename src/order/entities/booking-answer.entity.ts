import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Order } from "./order.entity";
import { Question } from "../../question/entities/question.entity";
import { Attendee } from "../../attendee/entities/attendees.entity";

@Entity("booking_answers")
export class BookingAnswer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "order_id" })
    orderId: number;

    @Column({ name: "question_id" })
    questionId: number;

    @Column({ name: "event_id" })
    eventId: number;

    @Column({ name: "show_id" })
    showId: number;

    @Column({ name: "user_id" })
    userId: string;

    @Column({ name: "ticket_type_id" })
    ticketTypeId: number;

    @Column({ name: "answer", type: "text" })
    answer: string;

    @ManyToOne(() => Order, (order) => order.bookingAnswers)
    @JoinColumn({ name: "order_id" })
    order: Order;

    @ManyToOne(() => Question)
    @JoinColumn({ name: "question_id" })
    question: Question;

    @OneToOne(() => Attendee)
    @JoinColumn({ name: "attendee_id" })
    attendee: Attendee;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}
