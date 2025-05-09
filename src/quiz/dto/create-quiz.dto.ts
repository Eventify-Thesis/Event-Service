import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuizQuestionDto } from './create-quiz-question.dto';

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsNumber()
  showId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizQuestionDto)
  questions: CreateQuizQuestionDto[];
}