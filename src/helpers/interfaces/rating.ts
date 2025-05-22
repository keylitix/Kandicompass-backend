import { ObjectId } from 'mongoose';

export interface ratingInterface {
  userID: ObjectId;
  contentID: ObjectId;
  rating: number;
  created_at: Date;
  updated_at: Date;
}
