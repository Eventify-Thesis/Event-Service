import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './entities/category.entity';
import { CategoryRepository } from './repositories/category.repository';
import { SuperAdminCategoryController } from './controllers/super-admin/category.controller';
import { CategoryController } from './controllers/category.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    AuthModule
  ],
  controllers: [SuperAdminCategoryController, CategoryController],
  providers: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
