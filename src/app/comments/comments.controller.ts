import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';

@ApiTags('Comment')
@Controller('comment')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() dto: CreateCommentDto) {
    return this.commentsService.addComment(dto);
  }

  @Get(':postId')
  get(@Param('postId') postId: string) {
    return this.commentsService.getComments(postId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update comment using comment ID' })
  update(@Param('id') id: string, @Body() dto: UpdateCommentDto) {
    return this.commentsService.updateComment(id, dto.message);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete comment using comment ID' })
  delete(@Param('id') id: string) {
    return this.commentsService.deleteComment(id);
  }
}
