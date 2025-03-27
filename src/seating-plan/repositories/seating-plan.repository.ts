import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SeatingPlan } from '../entities/seating-plan.entity';

@Injectable()
export class SeatingPlanRepository extends Repository<SeatingPlan> {
  constructor(private dataSource: DataSource) {
    super(SeatingPlan, dataSource.createEntityManager());
  }
}
