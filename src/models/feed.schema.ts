import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type FeedPostDocument = FeedPost & Document;

@Schema({ timestamps: true })
export class FeedPost {
  @Prop({ required: false })
  type: 'bead_created' | 'ownership_transfer';

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Bead', required: false })
  beadId: Types.ObjectId;

  @Prop({ required: false })
  beadName: string;

  @Prop({ required: false })
  beadImage: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false })
  userId: Types.ObjectId;

  @Prop({ type: [{ type: Object }], required: false })
  content: ContentBlock[];

  @Prop({ type: Object })
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export const FeedPostSchema = SchemaFactory.createForClass(FeedPost);

export type ContentBlock =
  | { type: 'text'; content: string }
  | { type: 'image'; content: string }
  | { type: 'video'; content: string };
