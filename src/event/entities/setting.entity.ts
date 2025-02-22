import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

export type SettingDocument = Setting & Document;

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class Setting {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'event' })
  eventId: string;

  @Prop({ required: true, maxlength: 40 })
  url: string;

  @Prop({ required: true })
  messageAttendees: string;

  @Prop({ required: true })
  isPrivate: boolean;

  @Prop({ required: true })
  eventDescription: string;

  @Prop({ required: true, default: false })
  isEnableQuestionForm: boolean;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
SettingSchema.plugin(paginate);
