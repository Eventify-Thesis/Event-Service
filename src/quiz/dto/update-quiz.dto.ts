import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { QuizQuestion } from "../entities/quiz-question.entity";

export class UpdateQuizDto {
    @IsString()
    @IsOptional()
    title?: string;
  
    @IsArray()
    @IsOptional()
    questions?: QuizQuestion[];
  
    @IsNumber()
    @IsOptional()
    passingScore?: number;
  
    @IsNumber()
    @IsOptional()
    maxAttempts?: number;
  
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
  }