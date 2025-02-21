import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ApiException {
  @ApiProperty()
  error: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  @IsOptional()
  data?: object;
}

export class PaginationResponse<TData> {
  @ApiProperty()
  totalDocs: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pagingCounter: number;

  @ApiProperty()
  hasPrevPage: boolean;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  prevPage: number | null;

  @ApiProperty()
  nextPage: number | null;

  docs: TData[];
}

export const unauthorizedResponse = {
  schema: {
    type: 'object',
    example: {
      error: {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized.',
      },
      data: {
        result: {},
      },
    },
  },
  description: '401. UnauthorizedException.',
};

export const unauthorizedAuth0Response = {
  schema: {
    type: 'object',
    example: {
      error: {
        code: 'AUTH0_TOKEN_ERROR',
        message: 'Token Auth0 Error.',
      },
      data: {
        result: {},
      },
    },
  },
  description: '401. UnauthorizedException.',
};

export const notFoundResponse = {
  schema: {
    type: 'object',
    example: {
      error: {
        code: 'OBJECT_NOT_FOUND',
        message: 'Object not found',
      },
      data: {
        result: {},
      },
    },
  },
  description: '404. Not Found.',
};

export const successResponse = {
  schema: {
    type: 'object',
    example: {
      data: {
        status: 'success',
      },
    },
  },
};
