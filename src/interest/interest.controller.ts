import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { InterestService } from './interest.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { MESSAGE } from './interest.constant';

@Controller('interests')
export class InterestController {
  constructor(private readonly interestService: InterestService) {}

  @Post()
  async create(@Body() createInterestDto: CreateInterestDto) {
    return await this.interestService.create(createInterestDto);
  }

  @Get('users/:userId/favourites')
  async findAllFavourite(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException(MESSAGE.USER_ID_REQUIRED);
    }
    return await this.interestService.findAllFavourite(userId);
  }

  @Get('users/:userId/events/:eventId')
  async findOne(@Param('userId') userId: string, @Param('eventId') eventId: string) {
    return await this.interestService.findOne(userId, eventId);
  }

  @Delete('users/:userId/events/:eventId')
  async remove(@Param('userId') userId: string, @Param('eventId') eventId: string) {
    return await this.interestService.remove(userId, eventId);
  }
}
