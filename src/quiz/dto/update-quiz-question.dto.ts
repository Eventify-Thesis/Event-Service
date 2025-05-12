import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuizOptionDto } from './quiz-option.dto';
import { ApiProperty } from '@nestjs/swagger';
import { CreateQuizQuestionDto } from './create-quiz-question.dto';

export class UpdateQuizQuestionDto extends CreateQuizQuestionDto { }