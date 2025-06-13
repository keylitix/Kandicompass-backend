import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from './comment.dto';
import { CommentDocument, Comment } from '@app/models/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>
  ) {}

  async addComment(dto: CreateCommentDto) {
    return this.commentModel.create(dto);
  }

  async getComments(postId: string) {
    return this.commentModel.find({ postId });
  }

  async updateComment(id: string, message: string) {
    return this.commentModel.findByIdAndUpdate(
      id,
      { message },
      { new: true }
    );
  }
  
  async deleteComment(id: string) {
    return this.commentModel.findByIdAndDelete(id);
  }
}
