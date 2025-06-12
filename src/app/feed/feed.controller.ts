import { Controller, Post, Get, Param, Delete, Query, Body } from '@nestjs/common';
import { FeedService } from './feed.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateFeedPostDto } from './feed.dto';

@ApiTags('Feed')
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post()
  create(@Body() dto: CreateFeedPostDto) {
    return this.feedService.create(dto);
  }

  @Get()
  findAll(@Query('skip') skip = 0, @Query('limit') limit = 10) {
    return this.feedService.findAll(Number(skip), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedService.remove(id);
  }
}