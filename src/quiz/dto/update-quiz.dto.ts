import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuizQuestion } from '../entities/quiz-question.entity';

export class UpdateQuizDto {
  @ApiProperty({
    description: 'Updated quiz title',
    required: false,
    example: 'Updated Quiz Title'
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Updated quiz questions',
    required: false,
    type: [QuizQuestion]
  })
  @IsArray()
  @IsOptional()
  questions?: QuizQuestion[];

  @ApiProperty({
    description: 'Updated passing score percentage',
    required: false,
    example: 75
  })
  @IsNumber()
  @IsOptional()
  passingScore?: number;

  @ApiProperty({
    description: 'Updated maximum allowed attempts',
    required: false,
    example: 3
  })
  @IsNumber()
  @IsOptional()
  maxAttempts?: number;

  @ApiProperty({
    description: 'Quiz active status',
    required: false,
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}