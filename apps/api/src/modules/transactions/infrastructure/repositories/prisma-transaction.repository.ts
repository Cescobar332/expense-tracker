import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma.service';
import {
  ITransactionRepository,
  TransactionFilters,
  PaginatedResult,
} from '../../domain/repositories/transaction.repository.interface';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Transaction | null> {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    return tx ? this.toDomain(tx) : null;
  }

  async findByFilters(filters: TransactionFilters): Promise<PaginatedResult<Transaction>> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = { userId: filters.userId };
    if (filters.type) where.type = filters.type;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: { category: true },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: data.map((t) => this.toDomain(t)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: {
    userId: string;
    categoryId: string;
    amount: number;
    type: string;
    description?: string;
    date: Date;
    isRecurring?: boolean;
  }): Promise<Transaction> {
    const tx = await this.prisma.transaction.create({
      data: {
        userId: data.userId,
        categoryId: data.categoryId,
        amount: new Prisma.Decimal(data.amount),
        type: data.type,
        description: data.description,
        date: data.date,
        isRecurring: data.isRecurring || false,
      },
    });
    return this.toDomain(tx);
  }

  async update(id: string, data: Partial<{
    categoryId: string;
    amount: number;
    type: string;
    description: string;
    date: Date;
    isRecurring: boolean;
  }>): Promise<Transaction> {
    const updateData: any = { ...data };
    if (data.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(data.amount);
    }
    const tx = await this.prisma.transaction.update({ where: { id }, data: updateData });
    return this.toDomain(tx);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({ where: { id } });
  }

  async getSummaryByDateRange(userId: string, startDate: Date, endDate: Date) {
    const result = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    for (const r of result) {
      const val = Number(r._sum.amount || 0);
      if (r.type === 'INCOME') totalIncome = val;
      if (r.type === 'EXPENSE') totalExpense = val;
    }

    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }

  async getByCategory(userId: string, startDate: Date, endDate: Date) {
    const result = await this.prisma.transaction.groupBy({
      by: ['categoryId', 'type'],
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const categoryIds = [...new Set(result.map((r) => r.categoryId))];
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });
    const catMap = new Map(categories.map((c) => [c.id, c]));

    return result.map((r) => {
      const cat = catMap.get(r.categoryId);
      return {
        categoryId: r.categoryId,
        categoryName: cat?.name || 'Sin categoría',
        categoryColor: cat?.color || '#64748b',
        total: Number(r._sum.amount || 0),
        type: r.type,
      };
    });
  }

  private toDomain(raw: any): Transaction {
    return new Transaction({
      id: raw.id,
      userId: raw.userId,
      categoryId: raw.categoryId,
      amount: raw.amount,
      type: raw.type,
      description: raw.description,
      date: raw.date,
      isRecurring: raw.isRecurring,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
