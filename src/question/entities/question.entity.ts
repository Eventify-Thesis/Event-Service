import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { QuestionBelongsTo, QuestionType } from '../enums/question-type.enum';

export type QuestionDocument = Question & Document;

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
export class Question {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: Object.values(QuestionType) })
  type: QuestionType;

  @Prop({})
  options?: string[];

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ required: true, type: Number })
  sortOrder: number;

  @Prop({ default: false })
  required: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ required: true, enum: Object.values(QuestionBelongsTo) })
  belongsTo: QuestionBelongsTo;

  @Prop({ default: false })
  isHidden: boolean;

  @Prop({ type: [String], required: false })
  ticketIds?: string[];

  isMultipleChoice(): boolean {
    return [QuestionType.MULTI_SELECT_DROPDOWN, QuestionType.CHECKBOX].includes(
      this.type,
    );
  }
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
QuestionSchema.plugin(paginate);
