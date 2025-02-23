import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'sport', required: true })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'Sport', required: true })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty({ example: 'Thể thao', required: true })
  @IsString()
  @IsNotEmpty()
  nameVi: string;

  @ApiProperty({ example: 'imageURL', required: false })
  @IsOptional()
  image: string;
}
