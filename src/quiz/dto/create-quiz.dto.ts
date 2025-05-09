import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuizQuestionDto } from './create-quiz-question.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({
    description: 'Quiz title',
    example: 'General Knowledge Quiz'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Show ID this quiz belongs to',
    example: 1
  })
  @IsNumber()
  showId: number;

  @ApiProperty({
    description: 'Quiz questions',
    example: []
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizQuestionDto)
  questions: CreateQuizQuestionDto[];
}