import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray } from 'class-validator';

export class GeneratePostDto {
  @IsString()
  @IsNotEmpty()
  eventName: string;

  @IsString()
  @IsNotEmpty()
  eventDescription: string;

  @IsString()
  @IsNotEmpty()
  eventType: string;

  @IsString()
  @IsNotEmpty()
  orgName: string;

  @IsString()
  @IsOptional()
  orgDescription?: string;

  @IsString()
  @IsOptional()
  orgLogoUrl?: string;

  @IsString()
  @IsOptional()
  eventLogoUrl?: string;

  @IsString()
  @IsOptional()
  eventBannerUrl?: string;

  @IsString()
  @IsOptional()
  venueName?: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsArray()
  @IsOptional()
  categories?: string[];

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  customPrompt?: string;
}
