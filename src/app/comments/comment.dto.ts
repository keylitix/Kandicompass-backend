import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate } from 'class-validator';

export class CreateCommentDto {
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

    @ApiProperty()
    @IsString()
    message: string;

    @ApiProperty()
    @IsDate()
    timestamp: Date;
}

export class UpdateCommentDto {
    @ApiProperty()
    @IsString()
    message: string;
  }
