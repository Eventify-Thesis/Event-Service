import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSeatCategoryMappingDto {
  @ApiProperty({ description: 'ID of the seating plan' })
  @IsUUID()
  seatingPlanId: string;

  @ApiProperty({ description: 'ID of the event' })
  @IsUUID()
  eventId: string;

  @ApiProperty({ description: 'ID of the show' })
  @IsUUID()
  showId: string;

  @ApiProperty({ description: 'Category name for the seats' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'ID of the ticket type' })
  @IsUUID()
  ticketTypeId: string;
}

export class BatchCreateSeatCategoryMappingDto {
  @ApiProperty({ type: [CreateSeatCategoryMappingDto] })
  mappings: CreateSeatCategoryMappingDto[];
}
