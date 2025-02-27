import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

export type CityDocument = City & Document;

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
export class City {
  @Prop()
  originId: number;

  @Prop({ required: true, maxlength: 40 })
  name: string;

  @Prop({ required: true, maxlength: 40 })
  nameEn: string;

  @Prop({ required: true, maxlength: 20 })
  type: string;

  @Prop({ required: true, maxlength: 20 })
  typeEn: string;

  @Prop({ maxlength: 20 })
  shortName: string;

  @Prop({ required: true })
  countryId: number;

  @Prop({ required: true })
  sort: number;

  @Prop({ required: true, default: 1 })
  status: number;

  @Prop({ required: true, maxlength: 100 })
  locationId: string;
}
export const CitySchema = SchemaFactory.createForClass(City);
CitySchema.plugin(paginate);
