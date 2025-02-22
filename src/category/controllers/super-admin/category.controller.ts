import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { get } from 'http';
import Role from 'src/auth/role/roles.enum';
import RoleGuard from 'src/auth/role/roles.guards';
import { CategoryService } from 'src/category/category.service';
import { CategoryDto } from 'src/category/dto/category-doc.dto';
import { CreateCategoryDto } from 'src/category/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/category/dto/update-category.dto';
import {
  successResponse,
  unauthorizedResponse,
} from 'src/common/docs/response.doc';

@ApiTags('Super Admin Category')
@Controller({
  path: 'super-admin/categories',
})
@ApiUnauthorizedResponse(unauthorizedResponse)
@UseGuards(RoleGuard(Role.SUPER_ADMIN))
export class SuperAdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiBody({
    required: true,
    type: CreateCategoryDto,
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.create(createCategoryDto);
  }

  @Patch(':id')
  @ApiOkResponse(successResponse)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    await this.categoryService.update(id, updateCategoryDto);
    return {
      status: 'success',
    };
  }

  @Delete(':id')
  @ApiOkResponse(successResponse)
  async remove(@Param('id') id: string) {
    await this.categoryService.remove(id);
    return {
      status: 'success',
    };
  }
}
