import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { BusinessType } from '../event.constant';

export class UpdateEventPaymentInfoDto {
  @ApiProperty({ required: true, default: 'Vietcombank' })
  @IsString()
  bankAccount: string;

  @ApiProperty({ required: true, default: 'John Doe' })
  @IsString()
  bankAccountName: string;

  @ApiProperty({ required: true, default: '123456789' })
  @IsString()
  bankAccountNumber: string;

  @ApiProperty({ required: true, default: 'Ho Chi Minh City' })
  @IsString()
  bankOffice: string;

  @ApiProperty({ required: true, default: 'ORGANIZER' })
  @IsEnum(BusinessType)
  businessType: BusinessType;

  @ApiProperty({ required: true, default: 'Eventure' })
  @IsString()
  name: string;

  @ApiProperty({ required: true, default: '123 Nguyen Dinh Chieu' })
  @IsString()
  address: string;

  @ApiProperty({ required: true, default: '123456789' })
  @IsString()
  taxNumber: string;
}
