import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { EventStatus, EventType } from '../event.constant';

export type EventDocument = Event & Document;

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
export class Event {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PaymentInfo' })
  paymentInfo: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Setting' })
  setting: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Show' })
  show: Types.ObjectId;

  @Prop()
  organizationId: string;

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

  @Prop({ required: false })
  venueName: string;

  @Prop({ required: false })
  cityId: string;

  @Prop({ required: false })
  districtId: string;

  @Prop({ required: false })
  wardId: string;

  @Prop({ required: false })
  street: string;

  @Prop({ required: true })
  categories: string[];

  @Prop({ required: true })
  categoriesIds: string[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.plugin(paginate);
