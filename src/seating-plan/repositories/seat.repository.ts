import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Seat } from '../entities/seat.entity';

@Injectable()
export class SeatRepository extends Repository<Seat> {
  constructor(private dataSource: DataSource) {
    super(Seat, dataSource.createEntityManager());
  }
}
