import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';
import { Bead } from './bead.schema';
@Schema()
export class Thread {
  @Prop()
  threadName: string;

  @Prop()
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  ownerId: Types.ObjectId;

  @Prop()
  qrCode: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bead' }], default: [] })
  beads: Bead[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] })
  members: mongoose.Types.ObjectId[];

  @Prop()
  visibility: string;

  @Prop({
    required: false,
    trim: true,
  })
  avatar: string;

  @Prop(
    raw({
      platform: { type: String },
      os: { type: String },
      browser: { type: String },
      ip: { type: String },
    }),
  )
  metadata: Record<string, any>;

  @Prop({ required: false, default: false })
  is_activated: boolean;

  @Prop()
  note: string;

  @Prop()
  admin_note: string;

  @Prop({ required: false, default: false })
  is_deleted: boolean;

  @Prop({ required: true, default: Date.now() })
  created_at: Date;

  @Prop({ required: true, default: Date.now() })
  updated_at: Date;
}

export type ThreadschemaType = HydratedDocument<Thread>;
export const ThreadSchema = SchemaFactory.createForClass(Thread);
