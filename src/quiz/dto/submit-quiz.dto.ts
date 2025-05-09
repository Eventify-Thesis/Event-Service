import { IsArray, IsNotEmpty, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SubmitAnswerDto } from './submit-answer.dto';

export class SubmitQuizDto {
  @ApiProperty({
    description: 'Quiz ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNumber()
  quizId: number;

  @ApiProperty({
    description: 'Array of submitted answers',
    type: [SubmitAnswerDto],
    example: [
      {
        questionId: 1,
        selectedOption: 2,
        timeTaken: 5.2
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];
}
