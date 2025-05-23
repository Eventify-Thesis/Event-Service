import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import {
  VoucherCodeType,
  VoucherDiscountType,
  VoucherStatus,
} from '../voucher.constant';
import { ApiProperty } from '@nestjs/swagger';

class ShowingDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsBoolean()
  @IsNotEmpty()
  isAllTicketTypes: boolean;

  @ApiProperty()
  @IsArray()
  ticketTypeIds: number[];
}

export class CreateVoucherDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({ enum: VoucherCodeType, example: VoucherCodeType.BULK })
  @IsEnum(VoucherCodeType)
  @IsNotEmpty()
  codeType: VoucherCodeType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  bulkCodePrefix?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  bulkCodeNumber?: number;

  @ApiProperty({
    enum: VoucherDiscountType,
    example: VoucherDiscountType.PERCENT,
  })
  @IsEnum(VoucherDiscountType)
  @IsNotEmpty()
  discountType: VoucherDiscountType;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  discountValue: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isUnlimited: boolean;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  maxOrderPerUser: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  minQtyPerOrder: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  maxQtyPerOrder: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  discountCode: string;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShowingDto)
  @IsNotEmpty()
  showingConfigs: ShowingDto[];

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isAllShowings: boolean;

  @ApiProperty({ enum: VoucherStatus, example: VoucherStatus.ACTIVE })
  @IsEnum(VoucherStatus)
  @IsOptional()
  status?: VoucherStatus;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endTime: Date;
}
