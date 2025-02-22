import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateDraftEventDto {
  @ApiProperty({ required: true, default: null })
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
    example:
      'https://salt.tkbcdn.com/ts/ds/67/03/5e/b821228f3c93e4aa76993160aa69afd8.png',
    required: true,
  })
  @IsUrl()
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
  @IsString()
  venueName: string;

  @ApiProperty()
  @IsNumber()
  cityId: number;

  @ApiProperty()
  @IsNumber()
  districtId: number;

  @ApiProperty()
  @IsNumber()
  wardId: number;

  @ApiProperty({ example: 'Street name', required: true })
  @IsString()
  street: string;

  @ApiProperty({ example: [1], required: true })
  @IsString()
  categoriesIds: number[];

  @ApiProperty()
  @IsEnum(['online', 'offline'])
  eventType: string;
}
