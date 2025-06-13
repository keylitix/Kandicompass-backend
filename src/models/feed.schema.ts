import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FeedPostDocument = FeedPost & Document;

@Schema({ timestamps: true })
export class FeedPost {
  @Prop({ required: true })
  type: 'bead_created' | 'ownership_transfer';

  @Prop({ required: true })
  beadId: string;

  @Prop({ required: true })
  beadName: string;

  @Prop({ required: true })
  beadImage: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  userAvatar: string;

  @Prop({ type: [{ type: Object }], required: true })
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
