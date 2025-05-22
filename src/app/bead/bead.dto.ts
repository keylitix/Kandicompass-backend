import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
export class createBeadDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  beadName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ownerId: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  ownershipHistory?: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  reviews?: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  stories?: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  threadId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  beadType: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  material: string;

  @IsOptional()
  @ApiProperty()
  color: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  size: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  shape: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  weight: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  finish: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  productCode: string;

  @IsOptional()
  @ApiProperty()
  description: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  quantity: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  supplier: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  pricePerUnit: number;
}

export class PagingQueryDto {
  @ApiProperty()
  page_number: number;
  @ApiProperty()
  page_size: number;
}
export class BeadUpdateDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  beadName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  beadType: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  material: string;

  @IsOptional()
  @ApiProperty()
  color: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  size: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  shape: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  weight: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  finish: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  productCode: string;

  @IsOptional()
  @ApiProperty()
  description: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  quantity: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  supplier: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  pricePerUnit: number;
}
