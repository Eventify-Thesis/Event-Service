import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import { BusinessType } from '../event.constant';

export type PaymentInfoDocument = PaymentInfo & Document;

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class PaymentInfo {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'event', unique: true, required: true })
  eventId: string;

  @Prop()
  bankAccount: string;

  @Prop()
  bankAccountName: string;

  @Prop()
  bankAccountNumber: string;

  @Prop()
  bankOffice: string;

  @Prop({ required: true, enum: BusinessType, default: 'organizer' })
  businessType: string;

  @Prop()
  companyName: string;

  @Prop()
  companyAddress: string;

  @Prop()
  taxNumber: string;
}

export const PaymentInfoSchema = SchemaFactory.createForClass(PaymentInfo);