import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @IsNumber()
  questionId: number;

  @ApiProperty({
    description: 'ID of the selected option',
    example: 2
  })
  @IsNumber()
  selectedOption: number;

  @ApiProperty({
    description: 'Time taken to answer (seconds)',
    required: false,
    example: 5.2
  })
  @IsNumber()
  timeTaken?: number; // in seconds
}