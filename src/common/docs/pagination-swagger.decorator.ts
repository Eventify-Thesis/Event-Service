import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginationResponse } from './response.doc';

export const PaginatedResponse = (itemDto: any) =>
  applyDecorators(
    ApiOkResponse({
      schema: {
        properties: {
          data: {
            allOf: [
              { $ref: getSchemaPath(PaginationResponse) },
              {
                properties: {
                  docs: {
                    type: 'array',
                    items: { $ref: getSchemaPath(itemDto) },
                  },
                },
              },
            ],
          },
        },
      },
    }),
  );
