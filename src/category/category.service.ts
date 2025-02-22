import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}
  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryRepository.create(createCategoryDto);
    return category;
  }

  async findAll() {
    return await this.categoryRepository.findAll();
  }

  async findOne(id: string) {
    return await this.categoryRepository.findById(id);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return await this.categoryRepository.findByIdAndUpdate(
      id,
      updateCategoryDto,
    );
  }

  async remove(id: string) {
    return await this.categoryRepository.deleteOne({
      _id: id,
    });
  }
}
