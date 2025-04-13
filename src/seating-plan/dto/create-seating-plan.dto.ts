import { IsNotEmpty, IsString, IsJSON } from 'class-validator';

export class CreateSeatingPlanDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsJSON()
  plan: any;
}
