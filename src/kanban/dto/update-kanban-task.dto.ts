import { IsOptional, IsString, IsDate, IsEnum, IsArray } from 'class-validator';
import { TaskPriority } from './create-kanban-task.dto';

export class UpdateKanbanTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  // @IsDate()
  dueDate?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];
}
