import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import AbstractRepository from 'src/common/abstracts/repository.abstract';
import { Interest, InterestDocument } from '../entities/Interest.entity';

@Injectable()
export class InterestRepository extends AbstractRepository<InterestDocument> {
  constructor(@InjectModel(Interest.name) model: PaginateModel<InterestDocument>) {
    super(model);
  }
}