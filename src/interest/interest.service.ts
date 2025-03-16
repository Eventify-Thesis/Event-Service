import { BadRequestException, Injectable } from '@nestjs/common';
import { InterestRepository } from './repositories/interest.repositories';
import { CreateInterestDto } from './dto/create-interest.dto';
import { MESSAGE } from './interest.constant';

@Injectable()
export class InterestService {
  constructor(private readonly interestRepository: InterestRepository) { }
  
  async checkExist(userId: string, eventId: string): Promise<boolean> {
    return !!(await this.interestRepository.exists({ userId, eventId }));
  }

  async create(createInterestDto: CreateInterestDto) {
    if (await this.checkExist(createInterestDto.userId, createInterestDto.eventId)) {
      throw new BadRequestException(MESSAGE.INTEREST_ALREADY_EXISTS);
    }
    return await this.interestRepository.create(createInterestDto);
  }
  
  async findAllFavourite(userId: string) {
    return await this.interestRepository.find({ userId: userId });
  }

  async findOne(userId: string, eventId: string) {
    const interest = await this.interestRepository.findOne({ userId, eventId });

    if (!interest) {
      throw new BadRequestException(MESSAGE.INTEREST_NOT_FOUND);
    }

    return interest;
  }


  async remove(userId: string, eventId: string) {
    if (!await this.checkExist(userId, eventId)) {
      throw new BadRequestException(MESSAGE.INTEREST_NOT_FOUND);
    }

    return await this.interestRepository.deleteOne({ userId: userId, eventId: eventId });
  }
}
