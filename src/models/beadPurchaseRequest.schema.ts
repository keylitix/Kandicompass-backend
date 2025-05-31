import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class BeadPurchaseRequest {
  @Prop({ type: Types.ObjectId, ref: 'Thread', required: true })
  threadId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Bead', required: true })
  beadId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  buyerId: Types.ObjectId;

  @Prop({ required: true })
  offerPrice: number;

  @Prop()
  message: string;

  @Prop({
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop()
  responseMessage: string;

  @Prop({ type: Date })
  respondedAt: Date;
}

export type BeadPurchaseRequestDocument = BeadPurchaseRequest & Document;
export const BeadPurchaseRequestSchema = SchemaFactory.createForClass(BeadPurchaseRequest);
