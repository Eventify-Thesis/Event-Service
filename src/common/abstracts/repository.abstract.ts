import {
  AggregateOptions,
  Document,
  FilterQuery,
  ProjectionType,
  QueryOptions,
  SaveOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';

import { PaginateModel } from 'mongoose';
import { ObjectId } from 'mongoose';
import { AppException } from 'src/common/exceptions/app.exception';
import { HttpStatus } from '@nestjs/common';
import { paginate } from 'mongoose-paginate-v2';

export type UpdatedModel = {
  matchedCount: number;
  modifiedCount: number;
  acknowledged: boolean;
  upsertedId: unknown | ObjectId;
  upsertedCount: number;
};

export type RemovedModel = {
  deletedCount: number;
  deleted: boolean;
};

export type CreateManyModel = {
  doc: object;
  saveOptions?: SaveOptions;
};

export default class AbstractRepository<T extends Document> {
  public model: PaginateModel<T>;
  constructor(model: PaginateModel<T>) {
    this.model = model;
  }

  /**
   * Get documents based on pagination
   * @param param0
   */
  public async pagination({
    conditions = {},
    select,
    sort,
    page = 1,
    limit = 20,
    populate,
    options,
  }: Record<string, any> = {}) {
    return await this.model.paginate(conditions, {
      select,
      sort,
      page,
      limit,
      populate,
      options,
    });
  }

  async create(doc: object, saveOptions?: SaveOptions): Promise<T> {
    const createEntity = new this.model(doc);
    return await createEntity.save(saveOptions);
  }

  public async createMany(values: CreateManyModel[]) {
    const entityPromise = values.map((value) => {
      const entity = new this.model(value);
      return entity.save();
    });
    return Promise.all(entityPromise);
  }

  async exists(filter: FilterQuery<T>) {
    return this.model.exists(filter);
  }

  async aggregate(pipeline: any, options?: AggregateOptions) {
    return this.model.aggregate(pipeline, options);
  }

  async find(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]> {
    return this.model.find(filter, null, options);
  }

  async findOrFail(
    filter: FilterQuery<T>,
    options?: QueryOptions,
    error?: { error: string; httpStatus: number; message: string },
  ): Promise<T> {
    const entity = await this.findOne(filter, null, options);
    if (entity) {
      return entity;
    }
    if (!error) {
      error = {
        error: 'ENTITY_NOT_FOUND',
        httpStatus: HttpStatus.NOT_FOUND,
        message: 'Not FOUND',
      };
    }
    throw new AppException(error);
  }

  async findOne(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions,
  ): Promise<T> {
    return this.model.findOne(filter, projection, options);
  }

  async findById(
    id: string,
    projection?: ProjectionType<T>,
    options?: QueryOptions,
  ): Promise<T | null> {
    return this.model.findById(id, projection, options);
  }

  async findAll(): Promise<T[]> {
    return this.model.find();
  }

  async deleteOne(
    filter: FilterQuery<T>,
    options?: QueryOptions,
  ): Promise<RemovedModel> {
    const { deletedCount } = await this.model.deleteOne(filter);
    return { deletedCount, deleted: !!deletedCount };
  }

  async updateOne(
    filter: FilterQuery<T>,
    updated: UpdateWithAggregationPipeline | UpdateQuery<T>,
    options?: QueryOptions,
  ): Promise<UpdatedModel> {
    return this.model.updateOne(filter, updated);
  }

  async findOneAndUpdate(
    filter: FilterQuery<T>,
    updated: UpdateWithAggregationPipeline | UpdateQuery<T>,
    options?: QueryOptions,
  ): Promise<UpdatedModel> {
    return this.model.findOneAndUpdate(filter, updated, options);
  }

  async findByIdAndUpdate(
    id: string,
    updated: UpdateWithAggregationPipeline | UpdateQuery<T>,
    options?: QueryOptions,
  ): Promise<T> {
    return this.model.findByIdAndUpdate(id, updated, options);
  }

  async updateMany(
    filter: FilterQuery<T>,
    updated: UpdateWithAggregationPipeline | UpdateQuery<T>,
    options?: QueryOptions,
  ): Promise<UpdatedModel> {
    return this.model.updateMany(filter, updated);
  }
}
