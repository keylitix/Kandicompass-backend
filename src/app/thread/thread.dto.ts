import { ThreadVisibilityType } from '@app/helpers/types/thread';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
export class createThreadDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  threadName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ownerId: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  beads?: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  members?: string[];

  @ApiProperty({ enum: ThreadVisibilityType, default: ThreadVisibilityType.Public })
  @IsEnum(ThreadVisibilityType)
  @IsOptional()
  visibility: ThreadVisibilityType;
}

export class PagingQueryDto {
  @ApiProperty()
  page_number: number;
  @ApiProperty()
  page_size: number;
}

export class createMessageDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  message: string;
}

export class ThreadUpdateDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  threadName: string;

  // @ApiProperty()
  // @IsString()
  // @IsOptional()
  // threadId: string;

  // @IsString()
  // @IsOptional()
  // @ApiProperty()
  // charmLocation: string;
}

export class AddMembersDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  memberIds: string[];
}
