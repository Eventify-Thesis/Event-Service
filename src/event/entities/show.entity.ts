import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { Ticket } from './ticket-type.entity';

export type ShowDocument = Show & Document;

@Schema({
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class Showing {
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Ticket' }],
    default: [],
  })
  tickets: Ticket[];

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;
}

@Schema({
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
export class Show {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'event',
    unique: true,
    required: true,
  })
  eventId: string;

  @Prop({ type: [Showing], required: true })
  showings: Showing[];
}

export const ShowingSchema = SchemaFactory.createForClass(Showing);
export const ShowSchema = SchemaFactory.createForClass(Show);
ShowSchema.plugin(paginate);
