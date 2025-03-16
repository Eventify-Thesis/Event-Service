import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VoucherService } from '../../voucher.service';
import { CreateVoucherDto } from '../../dto/create-voucher.dto';
import {
  UpdateVoucherActiveDto,
  UpdateVoucherDto,
} from '../../dto/update-voucher.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import EventRoleGuard from 'src/auth/event-role/event-roles.guards';
import EventRole from 'src/auth/event-role/event-roles.enum';
import { EventExists } from 'src/event/pipes/event-exists.pipe';
import { pagination } from 'src/common/decorators/pagination';
import { Query } from '@nestjs/common';
import {
  VoucherListAllQuery,
  VoucherListResponse,
} from '../../dto/voucher-doc.dto';
import { PaginationResponse } from 'src/common/docs/response.doc';

@Controller('planner/events/:eventId/vouchers')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
export class PlannerVoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Get('showings')
  async findAllShowings(@Param('eventId', EventExists) eventId: string) {
    return await this.voucherService.findAllShowings(eventId);
  }

  @ApiBody({ type: CreateVoucherDto })
  @ApiOkResponse({ type: CreateVoucherDto })
  @Post()
  async create(
    @Param('eventId', EventExists) eventId: string,
    @Body() createVoucherDto: CreateVoucherDto,
  ) {
    return await this.voucherService.create(eventId, createVoucherDto);
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
                    $ref: getSchemaPath(VoucherListResponse),
                  },
                },
              },
            },
          ],
        },
      },
    },
  })
  @ApiQuery({
    type: VoucherListAllQuery,
  })
  @ApiOkResponse({ type: CreateVoucherDto })
  async findAll(
    @Param('eventId', EventExists) eventId: string,
    @pagination() paramPagination,
    @Query() query,
  ) {
    return await this.voucherService.list(eventId, paramPagination, query);
  }

  @Get(':id')
  async findOne(
    @Param('eventId', EventExists) eventId: string,
    @Param('id') id: string,
  ) {
    return await this.voucherService.findOne(eventId, id);
  }

  @Post(':id/status')
  async changeStatus(
    @Param('eventId', EventExists) eventId: string,
    @Param('id') id: string,
    @Body() updateVoucherDto: UpdateVoucherActiveDto,
  ) {
    return await this.voucherService.changeStatus(
      eventId,
      id,
      updateVoucherDto,
    );
  }

  @Patch(':id')
  async update(
    @Param('eventId', EventExists) eventId: string,
    @Param('id') id: string,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ) {
    return await this.voucherService.update(eventId, id, updateVoucherDto);
  }

  @Delete(':id')
  async remove(
    @Param('eventId', EventExists) eventId: string,
    @Param('id') id: string,
  ) {
    return await this.voucherService.remove(eventId, id);
  }
}
