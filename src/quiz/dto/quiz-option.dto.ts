import { IsNumber, IsString } from 'class-validator';

export class QuizOptionDto {
  @IsNumber()
  id: number;

  @IsString()
  text: string;
}
