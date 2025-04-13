import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Get,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SeatCategoryMappingService } from '../../services/seat-category-mapping.service';
import { BatchCreateSeatCategoryMappingDto } from '../../dto/create-seat-category-mapping.dto';
import { BatchUpdateSeatCategoryMappingDto } from '../../dto/update-seat-category-mapping.dto';
import { SeatCategoryMapping } from '../../entities/seat-category-mapping.entity';
import { EventExists } from 'src/event/pipes/event-exists.pipe';
import { successResponse } from 'src/common/docs/response.doc';

@ApiTags('Seat Category Mappings')
@Controller('planner/events/:eventId/shows/:showId/seat-category-mappings')
export class PlannerSeatCategoryMappingController {
  constructor(
    private readonly seatCategoryMappingService: SeatCategoryMappingService,
  ) {}

  @Get()
  @ApiOkResponse({ type: [SeatCategoryMapping] })
  async findAll(
    @Param('eventId', EventExists) eventId: number,
    @Param('showId') showId: number,
  ) {
    return this.seatCategoryMappingService.findByShowId(eventId, showId);
  }

  @Post('')
  @ApiOkResponse({ type: [SeatCategoryMapping] })
  @ApiBody({ type: BatchCreateSeatCategoryMappingDto })
  async batchCreate(
    @Param('eventId', EventExists) eventId: number,
    @Param('showId') showId: number,
    @Body() dto: BatchCreateSeatCategoryMappingDto,
  ) {
    // Ensure all mappings have the correct eventId and showId
    dto.mappings = dto.mappings.map((mapping) => ({
      ...mapping,
      eventId,
      showId,
    }));
    return this.seatCategoryMappingService.batchCreate(dto);
  }

  @Put('')
  @ApiOkResponse({ type: [SeatCategoryMapping] })
  @ApiBody({ type: BatchUpdateSeatCategoryMappingDto })
  async batchUpdate(
    @Param('eventId', EventExists) eventId: number,
    @Param('showId') showId: number,
    @Body() dto: BatchUpdateSeatCategoryMappingDto,
  ) {
    return this.seatCategoryMappingService.batchUpdate(dto);
  }

  @Delete()
  @ApiOkResponse({ type: Object })
  async deleteByShowId(
    @Param('eventId', EventExists) eventId: number,
    @Param('showId') showId: number,
  ) {
    await this.seatCategoryMappingService.deleteByShowId(eventId, showId);
    return {
      success: true,
    };
  }

  @Post(':id/lock')
  @ApiOkResponse(successResponse)
  async lockSeatingPlan(
    @Param('eventId', EventExists) eventId: number,
    @Param('showId') showId: number,
    @Param('id') seatingPlanId: number,
    @Body() { locked }: { locked: boolean },
  ) {
    await this.seatCategoryMappingService.lockAndGenerateSeats(
      eventId,
      showId,
      seatingPlanId,
      locked,
    );

    return {
      message: 'success',
    };
  }
}
