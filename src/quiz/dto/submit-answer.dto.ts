import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiProperty({
    description: 'Code of the quiz',
    example: '123456',
  })
  @IsNumber()
  code: string;

  @ApiProperty({
    description: 'Index of the question in the sequence',
    example: 2,
  })
  @IsNumber()
  questionIndex: number;

  @ApiProperty({
    description: 'ID of the selected option',
    example: 2,
  })
  @IsNumber()
  selectedOption: number;

  @ApiProperty({
    description: 'Time taken to answer (seconds)',
    required: false,
    example: 5.2,
  })
  @IsNumber()
  timeTaken?: number; // in seconds
}
