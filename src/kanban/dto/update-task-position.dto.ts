import { IsNumber, IsOptional } from 'class-validator';

export class UpdateTaskPositionDto {
  @IsNumber()
  @IsOptional()
  columnId?: number;

  @IsNumber()
  position: number;
}
