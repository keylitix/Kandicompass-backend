import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LikeService } from './likes.service';
import { CreateLikeDto } from './like.dto';

@ApiTags('Like')
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post('toggle')
  toggleLike(@Body() dto: CreateLikeDto) {
    return this.likeService.toggleLike(dto);
  }

  @Get(':postId')
  getLikes(@Param('postId') postId: string) {
    return this.likeService.getLikes(postId);
  }
}