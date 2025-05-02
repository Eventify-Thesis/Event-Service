import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckInListListQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  eventId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  showId?: number;
}
