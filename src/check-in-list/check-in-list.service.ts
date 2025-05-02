import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateCheckInListDto } from './dto/create-check-in-list.dto';
import { UpdateCheckInListDto } from './dto/update-check-in-list.dto';
import { CheckInList } from './entities/check-in-list.entity';
import { TicketCheckInList } from './entities/ticket-check-in-list.entity';
import { IdHelper } from '../common/helper/id-helper';
import { CheckInListListQuery } from './dto/check-in-list-list.query';

@Injectable()
export class CheckInListService {
  constructor(
    private readonly dataSource: DataSource,
  ) { }

  async create(eventId: number, createCheckInListDto: CreateCheckInListDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create check-in list
      const checkInList = queryRunner.manager.create(CheckInList, {
        ...createCheckInListDto,
        eventId,
        showId: createCheckInListDto.showId,
        shortId: IdHelper.shortId(IdHelper.CHECK_IN_LIST_PREFIX),
      });
      await queryRunner.manager.save(checkInList);

      // Create ticket check-in list relationships
      const ticketCheckInLists = createCheckInListDto.ticketTypeIds.map(ticketTypeId =>
        queryRunner.manager.create(TicketCheckInList, {
          ticketTypeId,
          checkInListId: checkInList.id,
        })
      );
      await queryRunner.manager.save(ticketCheckInLists);

      await queryRunner.commitTransaction();

      // Load ticket types for response
      const result = await this.dataSource
        .getRepository(CheckInList)
        .createQueryBuilder('checkInList')
        .leftJoinAndSelect('checkInList.ticketTypes', 'ticketTypes')
        .where('checkInList.id = :id AND checkInList.eventId = :eventId', { id: checkInList.id, eventId })
        .getOne();

      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: CheckInListListQuery) {
    const queryBuilder = this.dataSource
      .getRepository(CheckInList)
      .createQueryBuilder('checkInList')
      .leftJoinAndSelect('checkInList.ticketTypes', 'ticketTypes')
      .leftJoinAndSelect('checkInList.show', 'show')
      .leftJoin('attendees', 'attendees', 'attendees.ticket_type_id IN (ticketTypes.id)')
      .addSelect('COUNT(DISTINCT CASE WHEN attendees.checked_in_at IS NOT NULL THEN attendees.id END)', 'checkedInAttendees')
      .addSelect('COUNT(DISTINCT attendees.id)', 'totalAttendees')
      .groupBy('checkInList.id')
      .addGroupBy('ticketTypes.id')
      .addGroupBy('show.id')
      .orderBy('checkInList.createdAt', 'DESC');

    if (query.eventId) {
      queryBuilder.andWhere('checkInList.eventId = :eventId', { eventId: query.eventId });
    }

    if (query.showId) {
      queryBuilder.andWhere('checkInList.showId = :showId', { showId: query.showId });
    }

    if (query.keyword) {
      queryBuilder.andWhere('checkInList.name ILIKE :keyword', {
        keyword: `%${query.keyword}%`,
      });
    }

    const [docs] = await Promise.all([
      queryBuilder
        .skip((query.page - 1) * query.limit)
        .take(query.limit)
        .getRawAndEntities(),
      queryBuilder.getCount(),
    ]);

    const totalDocs = await queryBuilder.getCount();

    const totalPages = Math.ceil(totalDocs / query.limit);
    const pagingCounter = (query.page - 1) * query.limit + 1;

    return {
      docs: docs.entities.map((entity, i) => ({
        ...entity,
        checkedInAttendees: parseInt(docs.raw[i].checkedInAttendees) || 0,
        totalAttendees: parseInt(docs.raw[i].totalAttendees) || 0,
      })),
      totalDocs,
      limit: query.limit,
      totalPages,
      page: query.page,
      pagingCounter,
      hasPrevPage: query.page > 1,
      hasNextPage: query.page < totalPages,
      prevPage: query.page > 1 ? query.page - 1 : null,
      nextPage: query.page < totalPages ? query.page + 1 : null,
    };
  }

  async findOne(eventId: number, id: number) {
    const result = await this.dataSource
      .getRepository(CheckInList)
      .createQueryBuilder('checkInList')
      .where('checkInList.eventId = :eventId AND checkInList.id = :id', { eventId, id })
      .leftJoinAndSelect('checkInList.ticketTypes', 'ticketTypes')
      .leftJoinAndSelect('checkInList.show', 'show')
      .leftJoin('attendees', 'attendees', 'attendees.ticket_type_id IN (ticketTypes.id)')
      .addSelect('COUNT(DISTINCT CASE WHEN attendees.checked_in_at IS NOT NULL THEN attendees.id END)', 'checkedInAttendees')
      .addSelect('COUNT(DISTINCT attendees.id)', 'totalAttendees')
      .groupBy('checkInList.id')
      .addGroupBy('ticketTypes.id')
      .addGroupBy('show.id')
      .getRawAndEntities();

    if (!result.entities[0]) {
      throw new NotFoundException('Check-in list not found');
    }

    return {
      ...result.entities[0],
      checkedInAttendees: parseInt(result.raw[0].checkedInAttendees) || 0,
      totalAttendees: parseInt(result.raw[0].totalAttendees) || 0,
    };
  }

  async update(eventId: number, id: number, updateCheckInListDto: UpdateCheckInListDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const checkInList = await this.findOne(eventId, id);

      // Update check-in list
      const updatedCheckInList = await queryRunner.manager.save(CheckInList, {
        ...checkInList,
        ...updateCheckInListDto,
      });

      // Update ticket check-in list relationships if ticketTypeIds is provided
      if (updateCheckInListDto.ticketTypeIds) {
        // Remove existing relationships
        await queryRunner.manager.delete(TicketCheckInList, {
          checkInListId: id,
        });

        // Create new relationships
        const ticketCheckInLists = updateCheckInListDto.ticketTypeIds.map(ticketTypeId =>
          queryRunner.manager.create(TicketCheckInList, {
            ticketTypeId,
            checkInListId: id,
          })
        );
        await queryRunner.manager.save(ticketCheckInLists);
      }

      await queryRunner.commitTransaction();

      return this.findOne(eventId, id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(eventId: number, id: number) {
    const checkInList = await this.findOne(eventId, id);

    await this.dataSource
      .getRepository(CheckInList)
      .softRemove(checkInList);
    return checkInList;
  }
}
