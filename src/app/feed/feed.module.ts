import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { FeedPost, FeedPostSchema } from '@app/models/feed.schema';
import { Like, LikeSchema } from '@app/models/like.schema';
import { Comment, CommentSchema } from '@app/models/comment.schema';
import { LikeController } from '../likes/likes.controller';
import { CommentsController } from '../comments/comments.controller';
import { LikeService } from '../likes/likes.service';
import { CommentsService } from '../comments/comments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeedPost.name, schema: FeedPostSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  exports: [
    MongooseModule
  ],
  controllers: [FeedController, LikeController, CommentsController],
  providers: [FeedService, LikeService, CommentsService],
})
export class FeedModule {}