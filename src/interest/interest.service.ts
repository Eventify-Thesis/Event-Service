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
    @InjectRepository(require('../event/entities/ticket-type.entity').TicketType)
    private readonly ticketTypeRepository: Repository<any>,
    @InjectRepository(require('../event/entities/show.entity').Show)
    private readonly showRepository: Repository<any>,
    @InjectRepository(require('../location/entities/city.entity').City)
    private readonly cityRepository: Repository<any>,
    @InjectRepository(require('../location/entities/district.entity').District)
    private readonly districtRepository: Repository<any>,
    @InjectRepository(require('../location/entities/ward.entity').Ward)
    private readonly wardRepository: Repository<any>,
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

  async findAllInterest(userId: string, paramPagination: { page?: number; limit?: number }) {
    const page = paramPagination?.page ?? 1;
    const limit = paramPagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.interestRepository.createQueryBuilder('interest')
      .leftJoin('interest.event', 'event')
      .where('interest.userId = :userId', { userId })
      .select([
        'interest.id',
        'interest.userId',
        'interest.eventId',
        'interest.createdAt',
        'interest.updatedAt',
        'event.eventName',
        'event.eventDescription',
        'event.eventType',
        'event.status',
        'event.eventLogoUrl',
        'event.eventBannerUrl',
        'event.venueName',
        'event.street',
        'event.categories',
        'event.cityId',
        'event.districtId',
        'event.wardId',
      ])
      .orderBy('interest.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [docs, totalDocs] = await queryBuilder.getManyAndCount();

    // Enrich each event with minimumPrice and startTime
    const enrichedDocs = await Promise.all(docs.map(async (doc: any) => {
      // Get all ticket types for this event
      const ticketTypes = await this.ticketTypeRepository.find({ where: { eventId: doc.eventId } });
      let minimumPrice = null;
      if (ticketTypes.some(t => t.isFree)) {
        minimumPrice = 0;
      } else {
        minimumPrice = ticketTypes.length > 0 ? Math.min(...ticketTypes.map(t => Number(t.price))) : null;
      }

      // Get all shows for this event
      const shows = await this.showRepository.find({ where: { eventId: doc.eventId } });
      let startTime = null;
      if (shows.length > 0) {
        startTime = Math.min(...shows.map(s => new Date(s.startTime).getTime()));
        startTime = new Date(startTime);
      }

      // Get city, district, ward names
      let cityNameEn = null, districtNameEn = null, wardNameEn = null;
      if (doc.event && doc.event.cityId) {
        const city = await this.cityRepository.findOne({ where: { originId: doc.event.cityId } });
        cityNameEn = city?.nameEn || null;
      }
      if (doc.event && doc.event.districtId) {
        const district = await this.districtRepository.findOne({ where: { originId: doc.event.districtId } });
        districtNameEn = district?.nameEn || null;
      }
      if (doc.event && doc.event.wardId) {
        const ward = await this.wardRepository.findOne({ where: { originId: doc.event.wardId } });
        wardNameEn = ward?.nameEn || null;
      }

      return {
        ...doc,
        minimumPrice,
        startTime,
        city: cityNameEn,
        district: districtNameEn,
        ward: wardNameEn,
      };
    }));

    return {
      docs: enrichedDocs,
      totalDocs,
      limit,
      totalPages: Math.ceil(totalDocs / limit),
      page,
      pagingCounter: skip + 1,
      hasPrevPage: page > 1,
      hasNextPage: skip + limit < totalDocs,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: skip + limit < totalDocs ? page + 1 : null,
    };
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
