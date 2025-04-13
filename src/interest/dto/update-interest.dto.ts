import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInterestDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  eventId: number;
}
