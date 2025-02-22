import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Category, CategoryDocument } from '../entities/category.entity';
import AbstractRepository from 'src/common/abstracts/repository.abstract';

@Injectable()
export class CategoryRepository extends AbstractRepository<CategoryDocument> {
  constructor(
    @InjectModel(Category.name) model: PaginateModel<CategoryDocument>,
  ) {
    super(model);
  }
}
