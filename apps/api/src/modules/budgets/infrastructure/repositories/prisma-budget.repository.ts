import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma.service';
import { IBudgetRepository, BudgetWithSpent } from '../../domain/repositories/budget.repository.interface';
import { Budget } from '../../domain/entities/budget.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaBudgetRepository implements IBudgetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Budget | null> {
    const b = await this.prisma.budget.findUnique({ where: { id } });
    return b ? this.toDomain(b) : null;
  }

  async findByUserId(userId: string, activeOnly = true): Promise<Budget[]> {
    const where: Prisma.BudgetWhereInput = { userId };
    if (activeOnly) where.isActive = true;
    const budgets = await this.prisma.budget.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return budgets.map((b) => this.toDomain(b));
  }

  async create(data: {
    userId: string;
    categoryId: string;
    amount: number;
    period: string;
    startDate: Date;
    endDate: Date;
    alertAt?: number;
  }): Promise<Budget> {
    const b = await this.prisma.budget.create({
      data: {
        userId: data.userId,
        categoryId: data.categoryId,
        amount: new Prisma.Decimal(data.amount),
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate,
        alertAt: data.alertAt ?? 80,
      },
    });
    return this.toDomain(b);
  }

  async update(id: string, data: Partial<{
    amount: number;
    period: string;
    startDate: Date;
    endDate: Date;
    alertAt: number;
    isActive: boolean;
  }>): Promise<Budget> {
    const updateData: any = { ...data };
    if (data.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(data.amount);
    }
    const b = await this.prisma.budget.update({ where: { id }, data: updateData });
    return this.toDomain(b);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.budget.delete({ where: { id } });
  }

  async getBudgetsWithSpent(userId: string): Promise<BudgetWithSpent[]> {
    const budgets = await this.prisma.budget.findMany({
      where: { userId, isActive: true },
      include: { category: true },
    });

    const results: BudgetWithSpent[] = [];

    for (const budget of budgets) {
      const spentResult = await this.prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: 'EXPENSE',
          date: {
            gte: budget.startDate,
            lte: budget.endDate,
          },
        },
        _sum: { amount: true },
      });

      const spent = Number(spentResult._sum.amount || 0);
      const budgetAmount = Number(budget.amount);
      const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

      const domainBudget = this.toDomain(budget);
      results.push(Object.assign(domainBudget, { spent, percentage }) as BudgetWithSpent);
    }

    return results;
  }

  private toDomain(raw: any): Budget {
    return new Budget({
      id: raw.id,
      userId: raw.userId,
      categoryId: raw.categoryId,
      amount: raw.amount,
      period: raw.period,
      startDate: raw.startDate,
      endDate: raw.endDate,
      alertAt: raw.alertAt,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
