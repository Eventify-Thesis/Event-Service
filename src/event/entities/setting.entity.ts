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
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'event',
    unique: true,
    required: true,
  })
  eventId: string;

  @Prop({ maxlength: 40 })
  url: string;

  @Prop()
  messageAttendees: string;

  @Prop({ default: true })
  isPrivate: boolean;

  @Prop()
  eventDescription: string;

  @Prop({ default: false })
  isEnableQuestionForm: boolean;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
SettingSchema.plugin(paginate);
