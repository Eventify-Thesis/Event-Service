import {
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
  IsObject,
  IsJSON,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSeatingPlanDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsJSON()
  plan: JSON;
}
