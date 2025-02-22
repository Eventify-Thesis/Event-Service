import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

export type CategoryDocument = Category & Document;

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class Category {
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
