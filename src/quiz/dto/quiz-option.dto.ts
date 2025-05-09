import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuizOptionDto {
  @ApiProperty({
    description: 'Option ID',
    example: 1
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Option text',
    example: 'Paris'
  })
  @IsString()
  text: string;
}
