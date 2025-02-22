import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { CategoryService } from 'src/category/category.service';
import { CategoryDto } from 'src/category/dto/category-doc.dto';

@ApiTags('Category')
@Controller('event/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Get()
  @ApiOkResponse({
    schema: {
      properties: {
        status: { type: 'string' },
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(CategoryDto),
          },
        },
      },
    },
  })
  async findAll() {
    return await this.categoryService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({
    schema: {
      properties: {
        status: { type: 'string' },
        data: {
          $ref: getSchemaPath(CategoryDto),
        },
      },
    },
  })
  async findOne(@Param('id') id: string) {
    return await this.categoryService.findOne(id);
  }
}
