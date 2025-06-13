import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLikeDto {
  @ApiProperty()
  @IsString()
  postId: string;

  @ApiProperty()
  @IsString()
  userId: string;
}
