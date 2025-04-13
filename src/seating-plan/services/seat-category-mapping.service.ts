import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SeatCategoryMappingRepository } from '../repositories/seat-category-mapping.repository';
import { BatchCreateSeatCategoryMappingDto } from '../dto/create-seat-category-mapping.dto';
import { BatchUpdateSeatCategoryMappingDto } from '../dto/update-seat-category-mapping.dto';
import { TicketType } from 'src/event/entities/ticket-type.entity';
import { Show } from 'src/event/entities/show.entity';
import { SeatingPlanRepository } from '../repositories/seating-plan.repository';
import { SeatRepository } from '../repositories/seat.repository';
import { Seat } from '../entities/seat.entity';

@Injectable()
export class SeatCategoryMappingService {
  constructor(
    @InjectRepository(SeatCategoryMappingRepository)
    private readonly seatCategoryMappingRepository: SeatCategoryMappingRepository,
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
    private readonly dataSource: DataSource,
    private readonly seatingPlanRepository: SeatingPlanRepository,
    private readonly seatRepository: SeatRepository,
  ) {}

  async batchCreate(dto: BatchCreateSeatCategoryMappingDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate ticket types

      for (const mapping of dto.mappings) {
        const ticketType = await queryRunner.manager.findOne(TicketType, {
          where: {
            id: mapping.ticketTypeId,
            eventId: mapping.eventId,
            showId: mapping.showId,
          },
        });

        if (!ticketType) {
          throw new BadRequestException(
            `Invalid ticket type for event ${mapping.eventId} and show ${mapping.showId}`,
          );
        }
      }

      const mappings = dto.mappings.map((mapping) =>
        this.seatCategoryMappingRepository.create(mapping),
      );

      const result = await queryRunner.manager.save(mappings);
      await queryRunner.commitTransaction();
      const eventId = dto.mappings[0].eventId;
      const showId = dto.mappings[0].showId;
      const seatingPlanId = dto.mappings[0].seatingPlanId;
      await this.showRepository.update(
        { id: showId, eventId },
        { seatingPlanId },
      );

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async batchUpdate(dto: BatchUpdateSeatCategoryMappingDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get a sample mapping to extract eventId, showId, and seatingPlanId
      if (dto.mappings.length === 0) {
        return [];
      }

      const firstMapping = dto.mappings[0];

      // Delete all existing mappings for this event, show, and seating plan
      await queryRunner.manager.delete(
        this.seatCategoryMappingRepository.target,
        {
          eventId: firstMapping.eventId,
          showId: firstMapping.showId,
          seatingPlanId: firstMapping.seatingPlanId,
        },
      );

      // Validate and create new mappings
      const newMappings = [];
      for (const mappingDto of dto.mappings) {
        // Validate ticket type if provided
        if (mappingDto.ticketTypeId) {
          const ticketType = await queryRunner.manager.findOne(TicketType, {
            where: {
              id: mappingDto.ticketTypeId,
              eventId: mappingDto.eventId,
              showId: mappingDto.showId,
            },
          });

          if (!ticketType) {
            throw new BadRequestException(
              `Invalid ticket type ${mappingDto.ticketTypeId}`,
            );
          }
        }

        // Create new mapping
        const newMapping =
          this.seatCategoryMappingRepository.create(mappingDto);
        newMappings.push(newMapping);
      }

      const result = await queryRunner.manager.save(newMappings);
      await queryRunner.commitTransaction();

      const eventId = dto.mappings[0].eventId;
      const showId = dto.mappings[0].showId;
      const seatingPlanId = dto.mappings[0].seatingPlanId;
      await this.showRepository.update(
        { id: showId, eventId },
        { seatingPlanId },
      );

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByShowId(eventId: number, showId: number) {
    return this.seatCategoryMappingRepository.find({
      where: { eventId, showId },
      relations: ['ticketType', 'seatingPlan'],
    });
  }

  async deleteByShowId(eventId: number, showId: number) {
    return this.seatCategoryMappingRepository.delete({ eventId, showId });
  }

  async lockAndGenerateSeats(
    eventId: number,
    showId: number,
    seatingPlanId: number,
    lock: boolean,
  ) {
    if (lock) {
      const seatingPlan = await this.seatingPlanRepository.findOne({
        where: {
          eventId,
          id: seatingPlanId,
        },
      });

      if (!seatingPlan) {
        throw new NotFoundException('Seating plan not found');
      }

      // Remove all previous seat generation
      await this.seatRepository.delete({ eventId, showId, seatingPlanId });

      // Get seat category mappings for this combination
      const seatCategoryMappings =
        await this.seatCategoryMappingRepository.find({
          where: {
            eventId,
            showId,
            seatingPlanId,
          },
        });

      if (!seatCategoryMappings.length) {
        throw new BadRequestException(
          'No seat category mappings found for this show',
        );
      }

      const plan = JSON.parse(seatingPlan.plan);

      const seats: Partial<Seat>[] = [];

      // Create a map of zoneId to ticketTypeId for quick lookup
      const zoneTicketTypeMap = new Map(
        seatCategoryMappings.map((mapping) => [
          mapping.category,
          mapping.ticketTypeId,
        ]),
      );

      // Iterate through each zone in the plan
      for (const zone of plan.zones || []) {
        // If zone has rows
        if (zone.rows) {
          for (const row of zone.rows) {
            for (const seat of row.seats || []) {
              const ticketTypeId = zoneTicketTypeMap.get(
                seat.category || row.category,
              );

              seats.push({
                id: seat.uuid,
                seatingPlanId,
                eventId,
                showId,
                zoneId: zone.id,
                rowLabel: row.label,
                seatNumber: seat.label,
                ticketTypeId,
              });
            }
          }
        }
      }

      // Save all seats
      await this.seatRepository.save(seats);

      // update show status to locked
      await this.showRepository.update(
        { id: showId, eventId },
        { locked: true },
      );
    } else {
      await this.showRepository.update(
        { id: showId, eventId },
        { locked: false },
      );
    }
  }
}
