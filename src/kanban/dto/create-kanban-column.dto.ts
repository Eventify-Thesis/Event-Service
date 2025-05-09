import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateKanbanColumnDto {
  @IsOptional()
  @IsNumber()
  boardId?: number;

  @IsString()
  name: string;

  @IsNumber()
  position: number;
}
