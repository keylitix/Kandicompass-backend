import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'Prefer not to say',
}

enum RoleEnum {
  ADMIN = 'Admin',
  CUSTOMER = 'Customer',
  SUPPLIER = 'Supplier',
  MODERATOR = 'Moderator',
}

enum AccountStatusEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
  BLOCKED = 'Blocked',
}

class AddressDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  street?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  city?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  state?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  zipCode?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  country?: string;
}

class BillingAddressDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  street?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  city?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  state?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  zipCode?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  country?: string;
}

class MembershipDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ enum: ['Free', 'Basic', 'Premium', 'Enterprise'] })
  subscriptionPlan?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  endDate?: Date;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ enum: ['Credit Card', 'PayPal', 'Bank Transfer', 'Crypto'] })
  paymentMethod?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BillingAddressDto)
  @ApiPropertyOptional()
  billingAddress?: BillingAddressDto;
}

class OrderItemDto {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  productId?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  productName?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  pricePerUnit?: number;
}

class OrderHistoryDto {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  orderId?: number;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  orderDate?: Date;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] })
  status?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  totalAmount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ApiPropertyOptional({ type: [OrderItemDto] })
  items?: OrderItemDto[];
}

class SecurityQuestionDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  question?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  answer?: string;
}

class SecurityDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  lastIpAddress?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  loginAttempts?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SecurityQuestionDto)
  @ApiPropertyOptional({ type: [SecurityQuestionDto] })
  securityQuestions?: SecurityQuestionDto[];
}

class PortfolioItemDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  fileId?: string;
}

class MetadataDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  platform?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  os?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  browser?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  ip?: string;
}

export class CreateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  fullName: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  password: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  profilePicture?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  dateOfBirth?: Date;

  @IsOptional()
  @IsEnum(GenderEnum)
  @ApiPropertyOptional({ enum: GenderEnum })
  gender?: GenderEnum;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @ApiPropertyOptional()
  address?: AddressDto;

  @IsOptional()
  @IsEnum(RoleEnum)
  @ApiPropertyOptional({ enum: RoleEnum, default: RoleEnum.CUSTOMER })
  role?: RoleEnum;

  @IsOptional()
  @IsEnum(AccountStatusEnum)
  @ApiPropertyOptional({ enum: AccountStatusEnum, default: AccountStatusEnum.ACTIVE })
  accountStatus?: AccountStatusEnum;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  lastLogin?: Date;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ default: false })
  emailVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ default: false })
  twoFactorAuthEnabled?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => MembershipDto)
  @ApiPropertyOptional()
  membership?: MembershipDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderHistoryDto)
  @ApiPropertyOptional({ type: [OrderHistoryDto] })
  orderHistory?: OrderHistoryDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SecurityDto)
  @ApiPropertyOptional()
  security?: SecurityDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortfolioItemDto)
  @ApiPropertyOptional({ type: [PortfolioItemDto] })
  portfolio?: PortfolioItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  @ApiPropertyOptional()
  metadata?: MetadataDto;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  token?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  forgotPasswordOTP?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ default: true })
  is_activated?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  otp?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  device_token?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ default: false })
  is_deleted?: boolean;
}

export class PagingQueryDto {
  @ApiProperty()
  page_no: number;
  @ApiProperty()
  page_size: number;
}

export class HeaderToken {
  @ApiProperty()
  ['x-access-token']: string;
}

export class LoginModel {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class AdminLoginModel {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  mode: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  roleId: string;
}

export class LoginWithNumberOtpDto {
  @ApiProperty()
  @IsString()
  otp: string;

  @ApiProperty()
  @IsString()
  contact_number: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  fullName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  password?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  profilePicture?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  dateOfBirth?: Date;

  @IsOptional()
  @IsEnum(GenderEnum)
  @ApiPropertyOptional({ enum: GenderEnum })
  gender?: GenderEnum;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @ApiPropertyOptional()
  address?: AddressDto;

  @IsOptional()
  @IsEnum(RoleEnum)
  @ApiPropertyOptional({ enum: RoleEnum })
  role?: RoleEnum;

  @IsOptional()
  @IsEnum(AccountStatusEnum)
  @ApiPropertyOptional({ enum: AccountStatusEnum })
  accountStatus?: AccountStatusEnum;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  lastLogin?: Date;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  emailVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  twoFactorAuthEnabled?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => MembershipDto)
  @ApiPropertyOptional()
  membership?: MembershipDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderHistoryDto)
  @ApiPropertyOptional({ type: [OrderHistoryDto] })
  orderHistory?: OrderHistoryDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SecurityDto)
  @ApiPropertyOptional()
  security?: SecurityDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortfolioItemDto)
  @ApiPropertyOptional({ type: [PortfolioItemDto] })
  portfolio?: PortfolioItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  @ApiPropertyOptional()
  metadata?: MetadataDto;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  token?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  forgotPasswordOTP?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  is_activated?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  otp?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  device_token?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  is_deleted?: boolean;
}
export class fileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  avatar: any;
}

export class ForgotPasswordDto {
  @IsString()
  @ApiProperty({ description: 'custmor email address' })
  email: string;
}
export class VerifyOtpDto {
  @IsOptional()
  @IsString()
  @ApiProperty()
  otp: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  token: string;
}

export class ResetPasswordDto {
  @IsString()
  @ApiProperty()
  token?: string;

  @ApiProperty({ description: 'New password for the custmor' })
  @IsString()
  newPassword: string;
}

export class SetNewPasswordDto {
  @IsOptional()
  @IsString()
  @ApiProperty()
  newPassword: string;
}
export class ChangePasswordDto {
  @IsOptional()
  @IsString()
  @ApiProperty()
  oldPassword: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  newPassword: string;
}

export class SearchUserDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  fullname?: string;
}
