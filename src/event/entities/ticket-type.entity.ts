import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

export type TicketDocument = Ticket & Document;

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
export class Ticket extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: false })
  isFree: boolean;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  minTicketPurchase: number;

  @Prop({ required: true })
  maxTicketPurchase: number;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  imageURL: string;

  @Prop({ default: false })
  isDisabled: boolean;

  @Prop({ required: true })
  position: number;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
TicketSchema.plugin(paginate);
