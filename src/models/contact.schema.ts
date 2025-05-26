import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Contact {
  @Prop({ required: false, trim: true })
  name: string;

  @Prop({ required: false, trim: true, lowercase: true })
  email: string;

  @Prop({ required: false })
  message: string;

  @Prop({ required: false, default: false })
  is_deleted: boolean;

  @Prop({ required: false, default: Date.now() })
  created_at: Date;

  @Prop({ required: false, default: Date.now() })
  updated_at: Date;
}

export type ContactschemaType = HydratedDocument<Contact>;
export const ContactSchema = SchemaFactory.createForClass(Contact);
