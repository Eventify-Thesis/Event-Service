import { IsString, IsNumber } from 'class-validator';

export class SubmitAnswerDto {
  @IsString()
  questionId: string;

  @IsNumber()
  selectedOption: number;

  @IsNumber()
  timeTaken: number; // in seconds
}