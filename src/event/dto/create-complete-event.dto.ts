import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { EventType, AgeRestriction, BusinessType } from '../event.constant';

export class CreateTicketTypeDto {
  @ApiProperty({ example: 'VIP' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1500000 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  isFree: boolean;

  @ApiProperty({ example: 100 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  minTicketPurchase: number;

  @ApiProperty({ example: 4 })
  @IsNumber()
  maxTicketPurchase: number;

  @ApiProperty({ example: '2025-02-01T00:00:00Z' })
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ example: '2025-02-15T17:00:00Z' })
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @ApiProperty({ example: 'VIP ticket with premium benefits' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'https://example.com/ticket-image.jpg' })
  @IsUrl()
  imageUrl: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isHidden: boolean;

  @ApiProperty({ example: 0 })
  @IsNumber()
  soldQuantity: number;
}

export class CreateShowDto {
  @ApiProperty({ example: '2025-02-15T19:30:00Z' })
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ example: '2025-02-15T22:00:00Z' })
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @ApiProperty({ type: [CreateTicketTypeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTicketTypeDto)
  ticketTypes: CreateTicketTypeDto[];
}

export class CreateEventSettingDto {
  @ApiProperty({ example: 'my-event-2025' })
  @IsString()
  url: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  maximumAttendees: number;

  @ApiProperty({ example: AgeRestriction.ALL_AGES, enum: AgeRestriction })
  @IsEnum(AgeRestriction)
  ageRestriction: AgeRestriction;

  @ApiProperty({ example: 'Please arrive 30 minutes early' })
  @IsOptional()
  @IsString()
  messageAttendees?: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isPrivate: boolean;

  @ApiProperty({ example: 'Detailed event description' })
  @IsOptional()
  @IsString()
  eventDescription?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isRefundable: boolean;
}

export class CreateEventPaymentInfoDto {
  @ApiProperty({ example: 'Vietcombank' })
  @IsString()
  bankAccount: string;

  @ApiProperty({ example: 'Company Name' })
  @IsString()
  bankAccountName: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  bankAccountNumber: string;

  @ApiProperty({ example: 'Hoan Kiem Branch' })
  @IsString()
  bankOffice: string;

  @ApiProperty({ example: BusinessType.COMPANY, enum: BusinessType })
  @IsEnum(BusinessType)
  businessType: BusinessType;

  @ApiProperty({ example: 'Company Name' })
  @IsString()
  name: string;

  @ApiProperty({ example: '123 Main Street, Hanoi' })
  @IsString()
  address: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  taxNumber: string;
}

export class CreateCompleteEventDto {
  @ApiProperty({ example: 'Amazing Concert 2025' })
  @IsString()
  eventName: string;

  @ApiProperty({ example: 'An amazing concert with top artists' })
  @IsString()
  eventDescription: string;

  @ApiProperty({ example: ['music'] })
  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @ApiProperty({ example: ['fc981c1b-485d-497d-b539-b8e73c4376bb'] })
  @IsArray()
  @IsString({ each: true })
  categoriesIds: string[];

  @ApiProperty({ example: EventType.OFFLINE, enum: EventType })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiProperty({ example: 'Event Organization' })
  @IsString()
  orgName: string;

  @ApiProperty({ example: 'Professional event organization' })
  @IsString()
  orgDescription: string;

  @ApiProperty({ example: 'https://example.com/org-logo.jpg' })
  @IsUrl()
  orgLogoUrl: string;

  @ApiProperty({ example: 'https://example.com/event-logo.jpg' })
  @IsUrl()
  eventLogoUrl: string;

  @ApiProperty({ example: 'https://example.com/event-banner.jpg' })
  @IsUrl()
  eventBannerUrl: string;

  @ApiProperty({ example: 'National Convention Center' })
  @IsOptional()
  @IsString()
  venueName?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  cityId?: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  districtId?: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  wardId?: number;

  @ApiProperty({ example: '123 Main Street' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ example: 21.0285 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: 105.8542 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: '123 Main Street, Hanoi, Vietnam' })
  @IsOptional()
  @IsString()
  formattedAddress?: string;

  @ApiProperty({ example: 'ChIJN1t_tDeuEmsRUsoyG83frY4' })
  @IsOptional()
  @IsString()
  placeId?: string;

  @ApiProperty({ example: 'demo-org-123' })
  @IsString()
  organizationId: string;

  @ApiProperty({ type: [CreateShowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShowDto)
  shows: CreateShowDto[];

  @ApiProperty({ type: CreateEventSettingDto })
  @ValidateNested()
  @Type(() => CreateEventSettingDto)
  setting: CreateEventSettingDto;

  @ApiProperty({ type: CreateEventPaymentInfoDto })
  @ValidateNested()
  @Type(() => CreateEventPaymentInfoDto)
  paymentInfo: CreateEventPaymentInfoDto;
}
