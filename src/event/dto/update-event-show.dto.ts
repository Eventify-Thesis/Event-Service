import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class UpdateTicketTypeDto {
  @ApiProperty({ required: false })
  @IsOptional()
  id?: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  price: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  minTicketPurchase: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  maxTicketPurchase: number;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;
}

export class ShowDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ type: [UpdateTicketTypeDto], required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTicketTypeDto)
  ticketTypes: UpdateTicketTypeDto[];

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
  @ApiProperty({ type: [ShowDto], required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShowDto)
  shows: ShowDto[];
}
