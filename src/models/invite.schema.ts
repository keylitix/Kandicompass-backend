import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ThreadInvite {
  @Prop({ required: false })
  threadId: string;

  @Prop({ required: false })
  threadName: string;

  @Prop({ required: false })
  email: string;

  @Prop({ required: false })
  inviterId: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'accepted' | 'declined';

  @Prop()
  token: string;

  @Prop()
  expiresAt: Date;
}

export type ThreadInviteDocument = ThreadInvite & Document;
export const ThreadInviteSchema = SchemaFactory.createForClass(ThreadInvite);
