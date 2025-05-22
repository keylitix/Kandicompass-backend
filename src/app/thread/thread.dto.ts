import { ThreadVisibilityType } from '@app/helpers/types/thread';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { CreateUserDto } from '../user/user.dto';
import { createBeadDto } from '../bead/bead.dto';
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
