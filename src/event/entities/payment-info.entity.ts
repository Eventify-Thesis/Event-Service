import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

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
  @Prop({ required: true, maxlength: 40 })
  bankName: string;

  @Prop({
    required: true,
    type: String,
  })
  bankHolderName: string;

  @Prop()
  bankAccountNumber: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'event' })
  eventId: string;
}

export const PaymentInfoSchema = SchemaFactory.createForClass(PaymentInfo);
PaymentInfoSchema.plugin(paginate);
