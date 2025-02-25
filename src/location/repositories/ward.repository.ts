import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import AbstractRepository from 'src/common/abstracts/repository.abstract';
import { Ward, WardDocument } from '../entities/ward.entity';

@Injectable()
export class WardRepository extends AbstractRepository<WardDocument> {
  constructor(@InjectModel(Ward.name) model: PaginateModel<WardDocument>) {
    super(model);
  }
}
