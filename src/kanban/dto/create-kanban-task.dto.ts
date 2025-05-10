import { IsNumber, IsOptional, IsString, IsDate, IsArray, IsUUID, IsEnum } from 'class-validator';

export enum TaskPriority {
  LOWEST = 'lowest',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  HIGHEST = 'highest'
}

export class CreateKanbanTaskDto {
  @IsNumber()
  columnId: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  position: number;

  @IsOptional()
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority = TaskPriority.MEDIUM;

  @IsOptional()
  @IsArray()
  labels?: string[];

  @IsArray()
  @IsOptional()
  assignees?: number[];
}
