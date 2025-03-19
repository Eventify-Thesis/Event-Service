import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { EventRole } from 'src/auth/event-role/event-roles.enum';
import EventRoleGuard from 'src/auth/event-role/event-roles.guards';
import Role from 'src/auth/role/roles.enum';
import RoleGuard from 'src/auth/role/roles.guards';
import { CategoryService } from 'src/category/category.service';
import { CategoryDto } from 'src/category/dto/category-doc.dto';

@ApiTags('Category')
@Controller({
  path: 'categories',
})
@ApiBearerAuth()
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
