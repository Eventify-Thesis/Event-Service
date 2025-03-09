import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class UpdateTicketDto {
  @ApiProperty({ required: true })
  @IsString()
  name: string;

  @ApiProperty({ required: true })
  @IsNumber()
  price: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  isFree: boolean;

  @ApiProperty({ required: true })
  @IsNumber()
  quantity: number;

  @ApiProperty({ required: true })
  @IsNumber()
  minTicketPurchase: number;

  @ApiProperty({ required: true })
  @IsNumber()
  maxTicketPurchase: number;

  @ApiProperty({ required: true })
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ required: true })
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @ApiProperty({ required: true })
  @IsString()
  description: string;

  @ApiProperty({ required: true })
  @IsString()
  imageURL: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isDisabled: boolean;

  @ApiProperty({ required: true })
  @IsNumber()
  position: number;
}

class UpdateShowingDto {
  @ApiProperty({ type: [UpdateTicketDto], required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTicketDto)
  tickets: UpdateTicketDto[];

  @ApiProperty({ required: true })
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ required: true })
  @IsDate()
  @Type(() => Date)
  endTime: Date;
}

export class UpdateEventShowDto {
  @ApiProperty({ type: [UpdateShowingDto], required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateShowingDto)
  showings: UpdateShowingDto[];
}
