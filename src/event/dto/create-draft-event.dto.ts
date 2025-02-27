import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { EventType } from '../event.constant';

export class CreateDraftEventDto {
  @ApiProperty({ required: false, default: null })
  @IsOptional()
  @IsMongoId()
  id: string;

  @ApiProperty({
    example:
      'https://salt.tkbcdn.com/ts/ds/67/03/5e/b821228f3c93e4aa76993160aa69afd8.png',
    required: true,
  })
  @IsUrl()
  eventLogoURL: string;

  @ApiProperty({
    example:
      'https://salt.tkbcdn.com/ts/ds/67/03/5e/b821228f3c93e4aa76993160aa69afd8.png',
    required: true,
  })
  @IsUrl()
  eventBannerURL: string;

  @ApiProperty({
    example: 'Event Name',
    required: true,
  })
  @IsString()
  eventName: string;

  @ApiProperty({ example: ['theatersandart'], required: true })
  @IsArray()
  categories: string[];

  @ApiProperty({ example: 'Event description', required: true })
  @IsString()
  eventDescription: string;

  @ApiProperty({
    example:
      'https://salt.tkbcdn.com/ts/ds/67/03/5e/b821228f3c93e4aa76993160aa69afd8.png',
    required: true,
  })
  @IsUrl()
  orgLogoURL: string;

  @ApiProperty({ example: 'Organization name', required: true })
  @IsString()
  orgName: string;

  @ApiProperty({ example: 'Organization description', required: true })
  @IsString()
  orgDescription: string;

  @ApiProperty({ example: 'Venue name', required: true })
  @IsOptional()
  @IsString()
  venueName: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  cityId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  districtId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  wardId: number;

  @ApiProperty({ example: 'Street name', required: true })
  @IsOptional()
  @IsString()
  street: string;

  @ApiProperty({ example: [1], required: true })
  @IsArray()
  @Type(() => Number)
  categoriesIds: number[];

  @ApiProperty({ required: true, default: EventType.OFFLINE })
  @IsEnum(Object.values(EventType))
  eventType: string;
}
