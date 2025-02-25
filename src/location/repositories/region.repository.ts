import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import AbstractRepository from 'src/common/abstracts/repository.abstract';
import { City, CityDocument } from '../entities/city.entity';

@Injectable()
export class CityRepository extends AbstractRepository<CityDocument> {
  constructor(@InjectModel(City.name) model: PaginateModel<CityDocument>) {
    super(model);
  }
}
