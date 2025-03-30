import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSeatCategoryMappingDto {
  @ApiProperty({ description: 'ID of the mapping to update' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'New category name for the seats', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'New ticket type ID', required: false })
  @IsUUID()
  @IsOptional()
  ticketTypeId?: string;
}

export class BatchUpdateSeatCategoryMappingDto {
  @ApiProperty({ type: [UpdateSeatCategoryMappingDto] })
  mappings: UpdateSeatCategoryMappingDto[];
}
