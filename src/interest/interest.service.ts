import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interest } from './entities/interest.entity';
import { CreateInterestDto } from './dto/create-interest.dto';
import { MESSAGE } from './interest.constant';

@Injectable()
export class InterestService {
  constructor(
    @InjectRepository(Interest)
    private readonly interestRepository: Repository<Interest>,
  ) {}

  async checkExist(userId: string, eventId: number): Promise<boolean> {
    const count = await this.interestRepository.count({
      where: { userId, eventId },
    });
    return count > 0;
  }

  async create(createInterestDto: CreateInterestDto) {
    if (
      await this.checkExist(createInterestDto.userId, createInterestDto.eventId)
    ) {
      throw new BadRequestException(MESSAGE.INTEREST_ALREADY_EXISTS);
    }

    const interest = this.interestRepository.create(createInterestDto);
    return await this.interestRepository.save(interest);
  }

  async findAllFavourite(userId: string) {
    return await this.interestRepository.find({ where: { userId } });
  }

  async findOne(userId: string, eventId: number) {
    const interest = await this.interestRepository.findOne({
      where: { userId, eventId },
    });

    if (!interest) {
      throw new BadRequestException(MESSAGE.INTEREST_NOT_FOUND);
    }

    return interest;
  }

  async remove(userId: string, eventId: number) {
    const deleteResult = await this.interestRepository.delete({
      userId,
      eventId,
    });

    if (!deleteResult.affected) {
      throw new BadRequestException(MESSAGE.INTEREST_NOT_FOUND);
    }

    return { message: 'Interest removed successfully' };
  }
}
