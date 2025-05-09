import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuizOptionDto } from './quiz-option.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizQuestionDto {
  @ApiProperty({
    description: 'The question text',
    example: 'What is the capital of France?'
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Array of answer options',
    type: [QuizOptionDto],
    example: [
      { id: 1, text: 'London' },
      { id: 2, text: 'Paris' },
      { id: 3, text: 'Berlin' }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizOptionDto)
  options: QuizOptionDto[];

  @ApiProperty({
    description: 'Index of the correct option (0-based)',
    example: 1
  })
  @IsNumber()
  correctOption: number;

  @ApiProperty({
    description: 'Time limit for answering (seconds)',
    required: false,
    example: 30
  })
  @IsOptional()
  @IsNumber()
  timeLimit?: number;
}
