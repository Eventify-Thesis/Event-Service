import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
  IsDate,
} from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsBoolean()
  isFree: boolean;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  minTicketPurchase: number;

  @IsNotEmpty()
  @IsNumber()
  maxTicketPurchase: number;

  @IsNotEmpty()
  @IsDate()
  startTime: Date;

  @IsNotEmpty()
  @IsDate()
  endTime: Date;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  imageURL: string;

  @IsBoolean()
  isDisabled: boolean;

  @IsNotEmpty()
  @IsNumber()
  position: number;
}
