import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import AbstractRepository from 'src/common/abstracts/repository.abstract';
import { District, DistrictDocument } from '../entities/district.entity';

@Injectable()
export class DistrictRepository extends AbstractRepository<DistrictDocument> {
  constructor(
    @InjectModel(District.name) model: PaginateModel<DistrictDocument>,
  ) {
    super(model);
  }
}
