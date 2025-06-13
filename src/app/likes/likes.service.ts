import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLikeDto } from './like.dto';
import { LikeDocument, Like } from '@app/models/like.schema';
@Injectable()
export class LikeService {
  constructor(@InjectModel(Like.name) private likeModel: Model<LikeDocument>) {}

  async toggleLike(dto: CreateLikeDto): Promise<{ liked: boolean }> {
    const existing = await this.likeModel.findOne({ postId: dto.postId, userId: dto.userId });
    if (existing) {
      await this.likeModel.deleteOne({ _id: existing._id });
      return { liked: false };
    }
    await this.likeModel.create(dto);
    return { liked: true };
  }

  async getLikes(postId: string) {
    return this.likeModel.find({ postId }).exec();
  }
}
