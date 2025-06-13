import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFeedPostDto } from './feed.dto';
import { FeedPost, FeedPostDocument } from '@app/models/feed.schema';

@Injectable()
export class FeedService {
  constructor(
    @InjectModel(FeedPost.name) private readonly feedPostModel: Model<FeedPostDocument>
  ) {}

  async create(data: CreateFeedPostDto) {
    return this.feedPostModel.create({ ...data });
  }

  async findAll(skip = 0, limit = 10) {
    return this.feedPostModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }

  async findOne(id: string) {
    return this.feedPostModel.findById(id).exec();
  }

  async remove(id: string) {
    return this.feedPostModel.findByIdAndDelete(id).exec();
  }
}