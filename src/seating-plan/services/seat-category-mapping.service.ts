import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SeatCategoryMappingRepository } from '../repositories/seat-category-mapping.repository';
import { BatchCreateSeatCategoryMappingDto } from '../dto/create-seat-category-mapping.dto';
import { BatchUpdateSeatCategoryMappingDto } from '../dto/update-seat-category-mapping.dto';
import { TicketType } from 'src/event/entities/ticket-type.entity';

@Injectable()
export class SeatCategoryMappingService {
  constructor(
    @InjectRepository(SeatCategoryMappingRepository)
    private readonly seatCategoryMappingRepository: SeatCategoryMappingRepository,
    private readonly dataSource: DataSource,
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
      const updatedMappings = [];
      for (const updateDto of dto.mappings) {
        const mapping = await queryRunner.manager.findOne(
          this.seatCategoryMappingRepository.target,
          { where: { id: updateDto.id } },
        );

        if (!mapping) {
          throw new BadRequestException(
            `Mapping with id ${updateDto.id} not found`,
          );
        }

        if (updateDto.ticketTypeId) {
          const ticketType = await queryRunner.manager.findOne(TicketType, {
            where: {
              id: updateDto.ticketTypeId,
              eventId: mapping.eventId,
              showId: mapping.showId,
            },
          });

          if (!ticketType) {
            throw new BadRequestException(
              `Invalid ticket type for mapping ${mapping.id}`,
            );
          }
        }

        Object.assign(mapping, updateDto);
        updatedMappings.push(mapping);
      }

      const result = await queryRunner.manager.save(updatedMappings);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteByShowId(showId: string) {
    return this.seatCategoryMappingRepository.delete({ showId });
  }
}
