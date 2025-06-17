import { IsString, IsArray, IsOptional, ValidateNested, IsNumber, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LocationDto {
  @ApiProperty() @IsNumber() lat: number;
  @ApiProperty() @IsNumber() lng: number;
  @ApiProperty() @IsString() address: string;
}

export class ContentBlockDto {
  @ApiProperty({ enum: ['text', 'image', 'video'] })
  @IsString()
  type: 'text' | 'image' | 'video';

  @ApiProperty() @IsString() content: string;
}

export class CreateFeedPostDto {
  @ApiProperty() @IsString() type: 'bead_created' | 'ownership_transfer';
  @ApiProperty() @IsString() beadId: string;
  @ApiProperty() @IsString() beadName: string;
  @ApiProperty() @IsString() beadImage: string;
  @ApiProperty() @IsString() userId: string;
  @ApiProperty() @IsString() userName: string;
  @ApiProperty() @IsString() userAvatar: string;

  @ApiProperty({ type: [ContentBlockDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentBlockDto)
  content: ContentBlockDto[];

  @ApiProperty({ type: LocationDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}

export class LikeDto {
  @ApiProperty()
  @IsMongoId()
  userId: string;
}

export class CommentDto {
  @ApiProperty()
  @IsMongoId()
  userId: string;

  @ApiProperty()
  @IsString()
  text: string;
}
