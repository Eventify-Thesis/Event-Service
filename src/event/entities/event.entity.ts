import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { EventStatus, EventType } from '../event.constant';

// @Schema({
//   toJSON: {
//     transform(doc, ret) {
//       ret.id = ret._id;
//       delete ret._id;
//     },
//   },
// })
// class PaymentInfo extends Document {
//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'paymentinfos' })
//   _id: string;
// }
// const PaymentInfoSchema = SchemaFactory.createForClass(PaymentInfo);

export type EventDocument = Event & Document;

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class Event {
  @Prop({ required: true })
  eventName: string;

  @Prop()
  eventDescription: string;

  @Prop({ required: true, enum: Object.values(EventType) })
  eventType: string;

  @Prop({
    required: true,
    enum: Object.values(EventStatus),
    default: EventStatus.DRAFT,
  })
  status: string;

  @Prop({ required: true })
  orgName: string;

  @Prop({ required: true })
  orgDescription: string;

  @Prop({ required: true })
  orgLogoURL: string;

  @Prop({ required: true })
  eventLogoURL: string;

  @Prop({ required: true })
  eventBannerURL: string;

  @Prop({ required: true })
  venueName: string;

  @Prop({ required: true })
  cityId: string;

  @Prop({ required: true })
  districtId: string;

  @Prop({ required: true })
  wardId: string;

  @Prop({ required: true })
  street: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.plugin(paginate);
