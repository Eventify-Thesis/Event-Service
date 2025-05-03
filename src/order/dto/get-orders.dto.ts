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

export enum OrderTime {
  UPCOMING = 'upcoming',
  PAST = 'past',
}

/**
 * Order status
 *
 * PENDING: The order is created but payment is not completed
 * PAID: The order is paid
 * PAYMENT_FAILED: The payment failed
 * CANCELLED: The order is cancelled
 * ALL: All orders
 * EXPIRED: The order is expired
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CANCELLED = 'CANCELLED',
  ALL = 'ALL',
  EXPIRED = 'EXPIRED'
}

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

  @IsOptional()
  @IsEnum(OrderTime)
  time?: OrderTime;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
