import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TicketType } from '../entities/ticket-type.entity';

@Injectable()
export class TicketTypeRepository extends Repository<TicketType> {
  constructor(private dataSource: DataSource) {
    super(TicketType, dataSource.createEntityManager());
  }
}
