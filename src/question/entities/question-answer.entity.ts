import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

export type QuestionAnswerDocument = QuestionAnswer & Document;

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
export class QuestionAnswer {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Question',
    required: true,
  })
  questionId: Types.ObjectId;

  @Prop({ type: [String] })
  answer: string[];

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;
}

export const QuestionAnswerSchema =
  SchemaFactory.createForClass(QuestionAnswer);
QuestionAnswerSchema.plugin(paginate);
