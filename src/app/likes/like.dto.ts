import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLikeDto {
  @ApiProperty()
  @IsString()
  postId: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  userName: string;

  @ApiProperty()
  @IsString()
  userAvatar: string;
}