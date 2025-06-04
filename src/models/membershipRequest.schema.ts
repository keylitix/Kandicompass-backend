// src/models/membershipRequest.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Thread } from './thread.schema';

export enum MembershipRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class MembershipRequest {
  @Prop({ type: Types.ObjectId, ref: 'Thread', required: true })
  threadId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requesterId: Types.ObjectId;

  @Prop({ type: String, required: false })
  message?: string;

  @Prop({
    type: String,
    enum: Object.values(MembershipRequestStatus),
    default: MembershipRequestStatus.PENDING,
  })
  status: MembershipRequestStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  responderId?: Types.ObjectId;

  @Prop({ type: String, required: false })
  responseMessage?: string;

  @Prop({ type: Date, required: false })
  respondedAt?: Date;
}

export type MembershipRequestDocument = MembershipRequest & Document;
export const MembershipRequestSchema = SchemaFactory.createForClass(MembershipRequest);
