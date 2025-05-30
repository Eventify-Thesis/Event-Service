import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Show } from '../entities/show.entity';

@Injectable()
export class ShowRepository extends Repository<Show> {
  constructor(private dataSource: DataSource) {
    super(Show, dataSource.createEntityManager());
  }
}
