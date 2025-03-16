import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import {
  VoucherCodeType,
  VoucherDiscountType,
  VoucherStatus,
} from '../voucher.constant';

export type VoucherDocument = Voucher & Document;

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
export class Voucher {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  eventId: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: true })
  active: boolean;

  @Prop({ required: true, enum: VoucherCodeType })
  codeType: VoucherCodeType;

  @Prop({ default: '' })
  bulkCodePrefix: string;

  @Prop({ default: 0 })
  bulkCodeNumber: number;

  @Prop({ required: true, enum: VoucherDiscountType })
  discountType: VoucherDiscountType;

  @Prop({ required: true })
  discountValue: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  isUnlimited: boolean;

  @Prop({ required: true })
  maxOrderPerUser: number;

  @Prop({ required: true })
  minQtyPerOrder: number;

  @Prop({ required: true })
  maxQtyPerOrder: number;

  @Prop({ required: true })
  discountCode: string;

  @Prop({
    type: [
      {
        id: { type: MongooseSchema.Types.ObjectId, required: true },
        isAllTickets: { type: Boolean, required: true },
        ticketIds: {
          type: [MongooseSchema.Types.ObjectId],
          required: true,
        },
      },
    ],
    required: true,
  })
  showings: {
    id: MongooseSchema.Types.ObjectId;
    isAllTickets: boolean;
    ticketIds: MongooseSchema.Types.ObjectId[];
  }[];

  @Prop({ required: true })
  isAllShowings: boolean;

  @Prop({ required: true, enum: VoucherStatus })
  status: VoucherStatus;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;
}

export const VoucherSchema = SchemaFactory.createForClass(Voucher);
VoucherSchema.plugin(paginate);
