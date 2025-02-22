import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
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

  @ApiProperty({ required: true, default: 'eventDescription' })
  @IsString()
  eventDescription: string;
}
