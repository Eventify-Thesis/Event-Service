import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Interest } from '../entities/interest.entity';

@Injectable()
export class InterestRepository extends Repository<Interest> {
  constructor(private dataSource: DataSource) {
    super(Interest, dataSource.createEntityManager());
  }
}
