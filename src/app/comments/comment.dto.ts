import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  postId: string;

  @ApiProperty()
  @IsString()
  userId: string;
}

export class UpdateCommentDto {
  @ApiProperty()
  @IsString()
  message: string;
}
