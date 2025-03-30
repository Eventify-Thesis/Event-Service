import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SeatCategoryMapping } from '../entities/seat-category-mapping.entity';

@Injectable()
export class SeatCategoryMappingRepository extends Repository<SeatCategoryMapping> {
  constructor(private dataSource: DataSource) {
    super(SeatCategoryMapping, dataSource.createEntityManager());
  }
}
