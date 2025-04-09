import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  PaginationResponse,
  successResponse,
} from 'src/common/docs/response.doc';
import { EventExists } from 'src/event/pipes/event-exists.pipe';
import { CreateSeatingPlanDto } from 'src/seating-plan/dto/create-seating-plan.dto';
import { SeatingPlanListQuery } from 'src/seating-plan/dto/seating-plan.doc.dto';
import { UpdateSeatingPlanDto } from 'src/seating-plan/dto/update-seating-plan.dto';
import { SeatingPlan } from 'src/seating-plan/entities/seating-plan.entity';
import { SeatingPlanService } from 'src/seating-plan/services/seating-plan.service';

@Controller('planner/events/:eventId/seating-plan')
export class PlannerSeatingPlanController {
  constructor(private readonly seatingPlanService: SeatingPlanService) {}

  @Post()
  @ApiOkResponse({ type: SeatingPlan })
  @ApiBody({ type: CreateSeatingPlanDto })
  async create(
    @Param('eventId', EventExists) eventId: string,
    @Body() createSeatingPlanDto: CreateSeatingPlanDto,
  ) {
    return await this.seatingPlanService.create(eventId, createSeatingPlanDto);
  }

  @Get()
  @ApiOkResponse({
    schema: {
      properties: {
        data: {
          allOf: [
            { $ref: getSchemaPath(PaginationResponse) },
            {
              properties: {
                docs: {
                  type: 'array',
                  items: {
                    $ref: getSchemaPath(SeatingPlan),
                  },
                },
              },
            },
          ],
        },
      },
    },
  })
  @ApiQuery({ type: SeatingPlanListQuery })
  async findAll(
    @Param('eventId', EventExists) eventId: string,
    @Query() query: SeatingPlanListQuery,
  ) {
    return await this.seatingPlanService.list(eventId, query);
  }

  @Get(':id')
  @ApiOkResponse({ type: SeatingPlan })
  async findOne(
    @Param('eventId', EventExists) eventId: string,
    @Param('id') id: string,
  ) {
    if (id === 'new') return null;
    return await this.seatingPlanService.findOne(eventId, id);
  }

  @Get(':id/categories')
  async getCategories(
    @Param('eventId', EventExists) eventId: string,
    @Param('id') id: string,
  ) {
    return await this.seatingPlanService.getCategories(eventId, id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: SeatingPlan })
  @ApiBody({ type: UpdateSeatingPlanDto })
  async update(
    @Param('eventId', EventExists) eventId: string,
    @Param('id') id: string,
    @Body() updateSeatingPlanDto: UpdateSeatingPlanDto,
  ) {
    return await this.seatingPlanService.update(
      eventId,
      id,
      updateSeatingPlanDto,
    );
  }

  @Delete(':id')
  @ApiOkResponse({ type: SeatingPlan })
  async remove(
    @Param('eventId', EventExists) eventId: string,
    @Param('id') id: string,
  ) {
    await this.seatingPlanService.remove(eventId, id);
    return {
      message: 'Seating plan deleted successfully',
    };
  }
}
