import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import EventRole from 'src/auth/event-role/event-roles.enum';

export type MemberDocument = Member & Document;

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
export class Member {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  organizationId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  eventId: Types.ObjectId;

  @Prop({ required: true, enum: Object.values(EventRole) })
  role: EventRole;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
MemberSchema.plugin(paginate);
