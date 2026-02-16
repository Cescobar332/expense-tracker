import { Category } from '../entities/category.entity';

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByUserId(userId: string): Promise<Category[]>;
  findByUserIdAndType(userId: string, type: string): Promise<Category[]>;
  create(data: {
    userId: string;
    name: string;
    type: string;
    color?: string;
    icon?: string;
    isDefault?: boolean;
  }): Promise<Category>;
  update(id: string, data: Partial<{
    name: string;
    color: string;
    icon: string;
  }>): Promise<Category>;
  delete(id: string): Promise<void>;
  createDefaultCategories(userId: string): Promise<void>;
}
