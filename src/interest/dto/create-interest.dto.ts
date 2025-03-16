import { IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateInterestDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsMongoId()
  @IsNotEmpty()
  eventId: string;
}
