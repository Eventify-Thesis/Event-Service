import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookingAnswer } from './booking-answer.entity';
import { Attendee } from '../../attendee/entities/attendees.entity';
import { Event } from '../../event/entities/event.entity';
import { Show } from '../../event/entities/show.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => BookingAnswer, (bookingAnswer) => bookingAnswer.order, {
    cascade: true,
  })
  bookingAnswers: BookingAnswer[];

  @OneToMany(() => Attendee, (attendee) => attendee.order, {
    cascade: true,
  })
  attendees: Attendee[];

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'public_id' })
  publicId: string;

  @Column({ name: 'short_id' })
  shortId: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'event_id' })
  eventId: number;

  @Column({ name: 'show_id' })
  showId: number;

  @Column({ name: 'booking_code', type: 'uuid' })
  bookingCode: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'subtotal_amount', type: 'decimal', precision: 10, scale: 2 })
  subtotalAmount: number;

  @Column({
    name: 'platform_discount_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  platformDiscountAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'reserved_until' })
  reservedUntil: Date;

  @Column({
    name: 'stripe_payment_intent_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripePaymentIntentId: string;

  @Column({ name: 'stripe_payment_status' })
  stripePaymentStatus: string;

  @Column({ name: 'stripe_payment_error_message' })
  stripePaymentErrorMessage: string;

  @Column({ name: 'stripe_customer_id' })
  stripeCustomerId: string;

  // New payment provider fields
  @Column({ name: 'payment_provider', default: 'stripe' })
  paymentProvider: string;

  @Column({ name: 'payment_provider_transaction_id', nullable: true })
  paymentProviderTransactionId: string;

  @Column({ name: 'payment_provider_metadata', type: 'text', nullable: true })
  paymentProviderMetadata: string;

  @Column({ name: 'payment_redirect_url', nullable: true })
  paymentRedirectUrl: string;

  @Column({ name: 'payment_qr_code', type: 'text', nullable: true })
  paymentQrCode: string;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @ManyToOne(() => Event, (event) => event.orders)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => Show, (show) => show.orders)
  @JoinColumn({ name: 'show_id' })
  show: Show;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  order_id: number;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'ticket_type_id' })
  ticketTypeId: number;

  @Column({
    name: 'name',
  })
  name: string;

  @Column({ name: 'seat_id', type: 'uuid', nullable: true })
  seatId?: string;

  @Column({ name: 'section_id', type: 'uuid', nullable: true })
  sectionId?: string;

  @Column({ name: 'section_name', nullable: true })
  sectionName?: string;

  @Column()
  quantity: number;

  @Column({ name: 'row_label' })
  rowLabel: string;

  @Column({ name: 'seat_number' })
  seatNumber: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
