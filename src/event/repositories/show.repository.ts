import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import AbstractRepository from 'src/common/abstracts/repository.abstract';
import { Show, ShowDocument } from '../entities/show.entity';

@Injectable()
export class ShowRepository extends AbstractRepository<ShowDocument> {
  constructor(
    @InjectModel(Show.name) model: PaginateModel<ShowDocument>,
  ) {
    super(model);
  }
}
