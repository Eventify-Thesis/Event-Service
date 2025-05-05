import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class SchedulePostDto {
  @IsString()
  @IsNotEmpty()
  pageId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsDateString()
  scheduledTime: string;

  @IsString({ each: true })
  imageUrls: string[];
}
