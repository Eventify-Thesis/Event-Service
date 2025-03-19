import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';
import { AgeRestriction } from '../event.constant';
export class UpdateEventSettingDto {
  @ApiProperty({ required: true, default: 'url' })
  @IsString()
  url: string;

  @ApiProperty({
    required: true,
    default: 'Your ticket has been purchase successfully',
  })
  @IsString()
  messageAttendees: string;

  @ApiProperty({ required: true, default: true })
  @IsBoolean()
  isPrivate: boolean;

  @ApiProperty({ required: true, default: AgeRestriction.ALL_AGES })
  @IsEnum(AgeRestriction)
  ageRestriction: AgeRestriction;

  @ApiProperty({ required: true, default: 100 })
  @IsNumber()
  maximumAttendees: number;
}
