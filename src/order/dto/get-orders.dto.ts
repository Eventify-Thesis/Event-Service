import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum OrderSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  TOTAL_AMOUNT = 'totalAmount',
  STATUS = 'status'
}

export enum QueryFilterOperator {
  Equals = 'eq',
  NotEquals = 'ne',
  GreaterThan = 'gt',
  GreaterThanOrEquals = 'gte',
  LessThan = 'lt',
  LessThanOrEquals = 'lte',
  Like = 'like',
  NotLike = 'not_like',
}

export type QueryFilterValue = string | number | boolean;

export type QueryFilterCondition = {
  operator: QueryFilterOperator;
  value: QueryFilterValue;
};

export type QueryFilterFields = {
  [key: string]: QueryFilterCondition | QueryFilterCondition[] | undefined;
};

export class GetOrdersQuery {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  filterFields?: QueryFilterFields;

  @IsOptional()
  @IsNumber()
  showId?: number;

  @IsOptional()
  @IsNumber()
  ticketTypeId?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortDirection?: 'asc' | 'desc';
}
