import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class AttendeeListQuery {
  @ApiProperty({
    required: false,
    example: 10,
    description: 'Number of items per page',
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'Page number',
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    required: false,
    example: 'john',
    description: 'Search by name or email',
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({
    required: false,
    example: 'firstName.desc createdAt.asc',
    description: 'Sort order, e.g., firstName.desc createdAt.asc',
  })
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiProperty({
    required: false,
    example: true,
    description: 'Filter by check-in status',
  })
  @IsOptional()
  isCheckedIn?: boolean;
}

export class AttendeeListResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  publicId: string;

  @ApiProperty()
  shortId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  ticketType: {
    id: number;
    name: string;
  };

  @ApiProperty()
  order: {
    id: number;
    publicId: string;
  };

  @ApiProperty()
  isCheckedIn: boolean;

  @ApiProperty()
  checkedInAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
