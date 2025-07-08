import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;
}

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
