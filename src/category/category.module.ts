import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryRepository } from './repositories/category.repository';
import { SuperAdminCategoryController } from './controllers/super-admin/category.controller';
import { CategoryController } from './controllers/category.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Category])],
  controllers: [SuperAdminCategoryController, CategoryController],
  providers: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
