import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateCheckInListDto {
  @IsString()
  name: string;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  showId: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  expiresAt?: string;

  @IsString()
  @IsOptional()
  activatesAt?: string;


  @IsArray()
  @Transform(({ value }) => value.map((v: string) => Number(v)))
  @IsNumber({}, { each: true })
  ticketTypeIds: number[];
}
