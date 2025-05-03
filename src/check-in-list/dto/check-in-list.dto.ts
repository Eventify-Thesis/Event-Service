import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CheckInListQuery {
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
  @IsUUID()
  eventId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  showId?: string;
}

export class CheckInAttendeeQuery {
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
}