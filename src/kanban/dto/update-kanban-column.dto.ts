import { IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateKanbanColumnDto {
  @IsOptional()
  @IsNumber()
  columnId?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}
