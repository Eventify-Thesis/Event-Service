import { IsArray, IsNotEmpty, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SubmitAnswerDto } from './submit-answer.dto';

export class SubmitQuizDto {
  @IsUUID()
  quizId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];
}
