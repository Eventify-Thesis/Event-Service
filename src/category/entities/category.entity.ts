import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

export type CategoryDocument = Category & Document;

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
export class Category {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true, maxlength: 40 })
  code: string;

  @Prop({ required: true, maxlength: 40 })
  nameEn: string;

  @Prop({ required: true, maxlength: 40 })
  nameVi: string;

  @Prop({ required: false })
  image: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.plugin(paginate);
