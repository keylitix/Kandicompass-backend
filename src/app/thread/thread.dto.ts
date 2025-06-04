import { ThreadVisibilityType } from '@app/helpers/types/thread';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsBoolean, IsNumber } from 'class-validator';
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

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ enum: ThreadVisibilityType, default: ThreadVisibilityType.Public })
  @IsEnum(ThreadVisibilityType)
  @IsOptional()
  visibility: ThreadVisibilityType;

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

export class CreateInviteDto {
  @ApiProperty()
  @IsString()
  threadId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  email?: string;
}

export class RespondToInviteDto {
  @ApiProperty()
  @IsString()
  inviteId: string;

  @ApiProperty()
  @IsBoolean()
  accept: boolean;
}

export class CreateBeadPurchaseRequestDto {
  @ApiProperty()
  @IsString()
  threadId: string;

  @ApiProperty()
  @IsString()
  beadId: string;

  @ApiProperty()
  @IsString()
  buyerId: string;

  @ApiProperty()
  @IsNumber()
  offerPrice: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  message?: string;
}
export class RespondToBeadPurchaseRequestDto {
  @ApiProperty()
  @IsString()
  requestId: string;

  @ApiProperty()
  @IsBoolean()
  accept: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  responseMessage?: string;
}

export class CreateMembershipRequestDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  threadId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  message?: string;
}

export class RespondToMembershipRequestDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  requestId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  threadId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  userId: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  accept: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  responseMessage?: string;
}

export class GetMembershipRequestsDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  threadId: string;
}
