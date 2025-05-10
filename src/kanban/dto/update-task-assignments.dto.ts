import { IsArray, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateTaskAssignmentsDto {
  @IsArray()
  @Transform(({ value }) => value.map((v: string) => Number(v)))
  assignees: number[];
}
