import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { QuestionType, QuestionBelongsTo } from '../enums/question-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: QuestionType.SINGLE_LINE_TEXT })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({ required: false })
  // @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiProperty({ required: false, example: QuestionBelongsTo.ORDER })
  @IsEnum(QuestionBelongsTo)
  belongsTo: QuestionBelongsTo;

  @ApiProperty({ required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ticketTypeIds?: string[];

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isHidden?: boolean;
}
