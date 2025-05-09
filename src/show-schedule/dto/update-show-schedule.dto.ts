import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { CreateShowScheduleDto } from './create-show-schedule.dto';

export class UpdateShowScheduleDto extends PartialType(
  OmitType(CreateShowScheduleDto, ['showId'] as const),
) {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;
}
