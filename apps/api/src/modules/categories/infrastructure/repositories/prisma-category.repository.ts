import { Injectable } from '@nestjs/common';
import { Category as PrismaCategory } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma.service';
import { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { Category } from '../../domain/entities/category.entity';

const DEFAULT_CATEGORIES = [
  { name: 'Salario', type: 'INCOME', color: '#22c55e', icon: '💼' },
  { name: 'Freelance', type: 'INCOME', color: '#3b82f6', icon: '💻' },
  { name: 'Inversiones', type: 'INCOME', color: '#8b5cf6', icon: '📈' },
  { name: 'Otros ingresos', type: 'INCOME', color: '#06b6d4', icon: '➕' },
  { name: 'Alimentación', type: 'EXPENSE', color: '#ef4444', icon: '🍽️' },
  { name: 'Transporte', type: 'EXPENSE', color: '#f97316', icon: '🚗' },
  { name: 'Vivienda', type: 'EXPENSE', color: '#eab308', icon: '🏠' },
  { name: 'Servicios', type: 'EXPENSE', color: '#14b8a6', icon: '⚡' },
  { name: 'Salud', type: 'EXPENSE', color: '#ec4899', icon: '❤️' },
  { name: 'Entretenimiento', type: 'EXPENSE', color: '#a855f7', icon: '🎬' },
  { name: 'Educación', type: 'EXPENSE', color: '#6366f1', icon: '📚' },
  { name: 'Ropa', type: 'EXPENSE', color: '#f43f5e', icon: '👕' },
  { name: 'Otros gastos', type: 'EXPENSE', color: '#64748b', icon: '📦' },
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
