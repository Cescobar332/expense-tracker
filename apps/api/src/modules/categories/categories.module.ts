import { Module } from '@nestjs/common';
import { CategoriesController } from './presentation/controllers/categories.controller';
import { PrismaCategoryRepository } from './infrastructure/repositories/prisma-category.repository';
import { CATEGORY_REPOSITORY } from './domain/repositories/category.repository.interface';

@Module({
  controllers: [CategoriesController],
  providers: [
    {
      provide: CATEGORY_REPOSITORY,
      useClass: PrismaCategoryRepository,
    },
  ],
  exports: [CATEGORY_REPOSITORY],
})
export class CategoriesModule {}
