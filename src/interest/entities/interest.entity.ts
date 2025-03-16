import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

export type InterestDocument = Interest & Document;

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
export class Interest {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  eventId: Types.ObjectId;
}

export const InterestSchema = SchemaFactory.createForClass(Interest);
InterestSchema.plugin(paginate);
