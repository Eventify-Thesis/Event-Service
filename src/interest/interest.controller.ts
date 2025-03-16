import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { InterestService } from './interest.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';
import { MESSAGE } from './interest.constant';

@Controller('interest')
export class InterestController {
  constructor(private readonly interestService: InterestService) {}

  @Post()
  async create(@Body() createInterestDto: CreateInterestDto) {
    return await this.interestService.create(createInterestDto);
  }

  @Get('favourite/:userId')
  async findAllFavourite(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException(MESSAGE.USER_ID_REQUIRED);
    }
    return await this.interestService.findAllFavourite(userId);
  }
  
  @Get('user/:userId/event/:eventId')
  async findOne(@Param('userId') userId: string, @Param('eventId') eventId: string) {
    return await this.interestService.findOne(userId, eventId);
  }

  @Delete('user/:userId/event/:eventId')
  async remove(@Param('userId') userId: string, @Param('eventId') eventId: string) {
    return await this.interestService.remove(userId, eventId);
  }
}
