import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

export type ShowDocument = Show & Document;

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class TicketType {
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
}

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class Showing {
  @Prop({ type: [TicketType], required: true })
  ticketTypes: TicketType[];

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;
}

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class Show {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'event', unique: true, required: true })
  eventId: string;

  @Prop({ type: [Showing], required: true })
  showings: Showing[];
}

export const ShowingSchema = SchemaFactory.createForClass(Showing);
export const ShowSchema = SchemaFactory.createForClass(Show);
ShowSchema.plugin(paginate);