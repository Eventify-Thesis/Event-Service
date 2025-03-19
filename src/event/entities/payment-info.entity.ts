import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BusinessType } from '../event.constant';
import { Event } from './event.entity';

@Entity('payment_info')
export class PaymentInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Event, (event) => event.paymentInfo)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'bank_account' })
  bankAccount: string;

  @Column({ name: 'bank_account_name' })
  bankAccountName: string;

  @Column({ name: 'bank_account_number' })
  bankAccountNumber: string;

  @Column({ name: 'bank_office' })
  bankOffice: string;

  @Column({
    type: 'enum',
    enum: BusinessType,
    name: 'business_type',
    default: BusinessType.COMPANY,
  })
  businessType: BusinessType;

  @Column({ name: 'company_name' })
  companyName: string;

  @Column({ name: 'company_address' })
  companyAddress: string;

  @Column({ name: 'company_tax_number' })
  companyTaxNumber: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
