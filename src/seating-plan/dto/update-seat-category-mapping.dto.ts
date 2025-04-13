import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSeatCategoryMappingDto {
  @ApiProperty({ description: 'ID of the seating plan' })
  seatingPlanId: number;

  @ApiProperty({ description: 'ID of the event' })
  eventId: number;

  @ApiProperty({ description: 'ID of the show' })
  showId: number;

  @ApiProperty({ description: 'Category name for the seats' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'ID of the ticket type' })
  ticketTypeId: number;
}

export class BatchUpdateSeatCategoryMappingDto {
  @ApiProperty({ type: [UpdateSeatCategoryMappingDto] })
  mappings: UpdateSeatCategoryMappingDto[];
}
