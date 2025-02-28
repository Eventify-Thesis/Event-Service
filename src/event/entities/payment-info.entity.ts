import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { BusinessType } from '../event.constant';

export type PaymentInfoDocument = PaymentInfo & Document;

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class PaymentInfo {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'event',
    unique: true,
    required: true,
  })
  eventId: string;

  @Prop()
  bankAccount: string;

  @Prop()
  bankAccountName: string;

  @Prop()
  bankAccountNumber: string;

  @Prop()
  bankOffice: string;

  @Prop({ required: true, enum: BusinessType, default: BusinessType.COMPANY })
  businessType: string;

  @Prop()
  companyName: string;

  @Prop()
  companyAddress: string;

  @Prop()
  taxNumber: string;
}

export const PaymentInfoSchema = SchemaFactory.createForClass(PaymentInfo);
