import { Injectable } from '@nestjs/common';
import { Category as PrismaCategory } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma.service';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';

const DEFAULT_CATEGORIES = [
  { name: 'Salario', type: 'INCOME', color: '#22c55e', icon: 'Briefcase' },
  { name: 'Freelance', type: 'INCOME', color: '#3b82f6', icon: 'Laptop' },
  { name: 'Inversiones', type: 'INCOME', color: '#8b5cf6', icon: 'TrendingUp' },
  { name: 'Otros ingresos', type: 'INCOME', color: '#06b6d4', icon: 'PlusCircle' },
  { name: 'Alimentación', type: 'EXPENSE', color: '#ef4444', icon: 'UtensilsCrossed' },
  { name: 'Transporte', type: 'EXPENSE', color: '#f97316', icon: 'Car' },
  { name: 'Vivienda', type: 'EXPENSE', color: '#eab308', icon: 'Home' },
  { name: 'Servicios', type: 'EXPENSE', color: '#14b8a6', icon: 'Zap' },
  { name: 'Salud', type: 'EXPENSE', color: '#ec4899', icon: 'Heart' },
  { name: 'Entretenimiento', type: 'EXPENSE', color: '#a855f7', icon: 'Film' },
  { name: 'Educación', type: 'EXPENSE', color: '#6366f1', icon: 'BookOpen' },
  { name: 'Ropa', type: 'EXPENSE', color: '#f43f5e', icon: 'Shirt' },
  { name: 'Otros gastos', type: 'EXPENSE', color: '#64748b', icon: 'Package' },
  { name: 'Ahorro', type: 'EXPENSE', color: '#f59e0b', icon: 'PiggyBank' },
];

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Category | null> {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    return cat ? this.toDomain(cat) : null;
  }

  async findByUserId(userId: string): Promise<Category[]> {
    const cats = await this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    return cats.map((c) => this.toDomain(c));
  }

  async findByUserIdAndType(userId: string, type: string): Promise<Category[]> {
    const cats = await this.prisma.category.findMany({
      where: { userId, type },
      orderBy: { name: 'asc' },
    });
    return cats.map((c) => this.toDomain(c));
  }

  async create(data: {
    userId: string;
    name: string;
    type: string;
    color?: string;
    icon?: string;
    isDefault?: boolean;
  }): Promise<Category> {
    const cat = await this.prisma.category.create({ data });
    return this.toDomain(cat);
  }

  async update(
    id: string,
    data: Partial<{ name: string; color: string; icon: string }>,
  ): Promise<Category> {
    const cat = await this.prisma.category.update({ where: { id }, data });
    return this.toDomain(cat);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }

  async createDefaultCategories(userId: string): Promise<void> {
    await this.prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({
        userId,
        ...c,
        isDefault: true,
      })),
    });
  }

  private toDomain(raw: PrismaCategory): Category {
    return new Category({
      id: raw.id,
      userId: raw.userId,
      name: raw.name,
      type: raw.type,
      color: raw.color,
      icon: raw.icon,
      isDefault: raw.isDefault,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
