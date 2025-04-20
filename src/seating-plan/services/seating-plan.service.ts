import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSeatingPlanDto } from '../dto/create-seating-plan.dto';
import { UpdateSeatingPlanDto } from '../dto/update-seating-plan.dto';
import { SeatingPlanRepository } from '../repositories/seating-plan.repository';
import { SeatingPlanListQuery } from '../dto/seating-plan.doc.dto';
import { SeatRepository } from '../repositories/seat.repository';

@Injectable()
export class SeatingPlanService {
  constructor(private readonly seatingPlanRepository: SeatingPlanRepository) { }

  async create(eventId: number, createSeatingPlanDto: CreateSeatingPlanDto) {
    const seatingPlan = await this.seatingPlanRepository.save({
      ...createSeatingPlanDto,
      eventId,
    });

    return seatingPlan;
  }

  async list(
    eventId: number,
    { page = 1, limit = 10, keyword }: SeatingPlanListQuery,
  ) {
    const queryBuilder = this.seatingPlanRepository
      .createQueryBuilder('seatingPlan')
      .where('seatingPlan.event_id = :eventId', { eventId });

    if (keyword) {
      const searchKeyword = `%${keyword.trim()}%`;
      queryBuilder.andWhere('(seatingPlan.name ILIKE :keyword)', {
        keyword: searchKeyword,
      });
    }

    const [result, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('seatingPlan.createdAt', 'ASC')
      .getManyAndCount();

    return {
      docs: result,
      totalDocs: total,
      itemCount: result.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findOne(eventId: number, id: number) {
    return this.seatingPlanRepository.findOne({
      where: {
        eventId,
        id,
      },
    });
  }

  async getCategories(eventId: number, id: number) {
    const seatingPlan = await this.seatingPlanRepository.findOne({
      where: {
        eventId,
        id,
      },
    });

    const plan = JSON.parse(seatingPlan.plan);
    return plan.categories;
  }

  async update(
    eventId: number,
    id: number,
    updateSeatingPlanDto: UpdateSeatingPlanDto,
  ) {
    await this.seatingPlanRepository.update(
      {
        eventId,
        id,
      },
      updateSeatingPlanDto,
    );
  }

  async remove(eventId: number, id: number) {
    await this.seatingPlanRepository.delete({
      eventId,
      id,
    });
  }

  async getEventShowSeatingPlan(eventId: number, seatingPlanId: number) {
    return await this.seatingPlanRepository.findOne({
      where: {
        eventId,
        id: seatingPlanId,
      },
    });
  }
}
