import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuizOptionDto } from './quiz-option.dto';

export class CreateQuizQuestionDto {
  @IsString()
  text: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizOptionDto)
  options: QuizOptionDto[];

  @IsNumber()
  correctOption: number;

  @IsOptional()
  @IsNumber()
  timeLimit?: number;
}
