import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true }) postId: string;
  @Prop({ required: true }) userId: string;
  @Prop({ required: true }) userName: string;
  @Prop({ required: true }) userAvatar: string;
  @Prop({ required: true }) message: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);