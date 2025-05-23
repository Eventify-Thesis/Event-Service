import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { pagination } from '../common/decorators/pagination';
import { InterestPaginationDto } from './dto/interest-pagination.dto';
import { PaginationResponse } from '../common/docs/response.doc';
import { InterestService } from './interest.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { MESSAGE } from './interest.constant';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class InterestController {
  constructor(private readonly interestService: InterestService) {}

  @MessagePattern('interestCreate')
  async create(@Payload() createInterestDto: CreateInterestDto) {
    return await this.interestService.create(createInterestDto);
  }

  @MessagePattern('interestFindAllInterest')
  async findAllInterest(
    @Payload() data: { userId: string; pagination: any }) {
    return await this.interestService.findAllInterest(data.userId, data.pagination);
  }

  @MessagePattern('interestCheckExist')
  async checkExist(@Payload() data: { userId: string, eventId: number }) {
    return await this.interestService.checkExist(data.userId, data.eventId);
  }

  @MessagePattern('interestRemove')
  async remove(@Payload() data: { userId: string, eventId: number }) {
    return await this.interestService.remove(data.userId, data.eventId);
  }
}
