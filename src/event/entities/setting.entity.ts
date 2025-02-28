import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { AgeRestriction } from '../event.constant';

export type SettingDocument = Setting & Document;

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
export class Setting {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

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
  maximumAttendees: number;

  @Prop()
  ageRestriction: AgeRestriction;

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
