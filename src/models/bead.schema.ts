import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Thread } from './thread.schema';
import mongoose from 'mongoose';
import { User } from './user.schema';
@Schema()
export class Bead {
  @Prop()
  beadName: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  ownerId: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  currentOwnerId: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Thread' })
  threadId: Thread;

  @Prop({ type: [String], default: [] })
  ownershipHistory: string[];

  @Prop({ type: [String], default: [] })
  reviews: string[];

  @Prop({ type: [String], default: [] })
  stories: string[];

  @Prop()
  beadType: string;

  @Prop()
  material: string;

  @Prop()
  color: string;

  @Prop()
  size: number;

  @Prop()
  shape: string;

  @Prop()
  weight: number;

  @Prop()
  finish: string;

  @Prop()
  quantity: number;

  @Prop()
  pricePerUnit: number;

  @Prop()
  supplier: string;

  @Prop()
  productCode: string;

  @Prop()
  description: string;

  @Prop()
  link: string;

  @Prop({
    required: false,
    trim: true,
  })
  avatar: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop()
  qrCode: string;

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

export type BeadschemaType = HydratedDocument<Bead>;
export const BeadSchema = SchemaFactory.createForClass(Bead);
