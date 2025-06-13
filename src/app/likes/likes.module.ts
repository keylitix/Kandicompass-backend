import { Module } from '@nestjs/common';
import { LikeService } from './likes.service';
import { LikeController } from './likes.controller';

@Module({
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikesModule {}
