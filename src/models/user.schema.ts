import { Schema, SchemaFactory, Prop, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: false, trim: true })
  fullName: string;

  @Prop({ required: false, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: false })
  password: string;

  @Prop({ trim: true })
  phoneNumber: string;

  @Prop({ required: false, default: 'default-profile.jpg' })
  profilePicture: string;

  @Prop()
  dateOfBirth: Date;

  @Prop({ required: false, enum: ['male', 'female', 'Other', 'Prefer not to say'] })
  gender: string;

  @Prop({
    type: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
  })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Prop({ required: false, enum: ['Admin', 'Customer', 'Supplier', 'Moderator'], default: 'Customer' })
  role: string;

  @Prop({ required: false, enum: ['Active', 'Inactive', 'Suspended', 'Blocked'], default: 'Active' })
  accountStatus: string;

  @Prop()
  lastLogin: Date;

  @Prop({ required: false, default: false })
  emailVerified: boolean;

  @Prop({ required: false, default: false })
  twoFactorAuthEnabled: boolean;

  @Prop({
    type: {
      subscriptionPlan: { type: String, enum: ['Free', 'Basic', 'Premium', 'Enterprise'] },
      startDate: Date,
      endDate: Date,
      paymentMethod: { type: String, enum: ['Credit Card', 'PayPal', 'Bank Transfer', 'Crypto'] },
      billingAddress: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true },
        country: { type: String, trim: true },
      },
    },
    required: false,
  })
  membership?: {
    subscriptionPlan: string;
    startDate: Date;
    endDate: Date;
    paymentMethod: string;
    billingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };

  @Prop({
    type: [
      {
        orderId: Number,
        orderDate: Date,
        status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
        totalAmount: Number,
        items: [
          {
            productId: Number,
            productName: String,
            quantity: Number,
            pricePerUnit: Number,
          },
        ],
      },
    ],
    default: [],
  })
  orderHistory: Array<{
    orderId: number;
    orderDate: Date;
    status: string;
    totalAmount: number;
    items: Array<{
      productId: number;
      productName: string;
      quantity: number;
      pricePerUnit: number;
    }>;
  }>;

  @Prop({
    type: {
      lastIpAddress: String,
      loginAttempts: { type: Number, default: 0 },
      securityQuestions: [
        {
          question: String,
          answer: String,
        },
      ],
    },
    default: {
      lastIpAddress: '',
      loginAttempts: 0,
      securityQuestions: [],
    },
  })
  security: {
    lastIpAddress: string;
    loginAttempts: number;
    securityQuestions: Array<{
      question: string;
      answer: string;
    }>;
  };

  @Prop({
    required: false,
    trim: true,
  })
  avatar: string;

  @Prop({
    required: false,
    type: [Object],
  })
  portfolio: { fileUrl: string; fileId: string }[];

  @Prop(
    raw({
      platform: { type: String },
      os: { type: String },
      browser: { type: String },
      ip: { type: String },
    }),
  )
  metadata: Record<string, any>;

  @Prop({ required: false })
  token: string;

  @Prop()
  forgotPasswordOTP: string;

  @Prop({ default: true })
  is_activated: boolean;

  @Prop({ required: false })
  otp: string;

  @Prop({ required: false })
  device_token: string;

  // @Prop({ required: false, default: false })
  // default_admin: boolean;

  @Prop({ required: false, default: false })
  is_deleted: boolean;

  @Prop({ required: false, default: Date.now() })
  created_at: Date;

  @Prop({ required: false, default: Date.now() })
  updated_at: Date;
}

export type UserSchemaType = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});
