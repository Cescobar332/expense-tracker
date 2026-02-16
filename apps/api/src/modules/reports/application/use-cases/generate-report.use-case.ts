import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma.service';

@Injectable()
export class GenerateReportUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async getMonthlyTrend(userId: string, months: number = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    const monthlyData = new Map<string, { income: number; expense: number }>();

    for (const tx of transactions) {
      const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData.has(key)) {
        monthlyData.set(key, { income: 0, expense: 0 });
      }
      const entry = monthlyData.get(key)!;
      const amount = Number(tx.amount);
      if (tx.type === 'INCOME') entry.income += amount;
      else entry.expense += amount;
    }

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        income: Math.round(data.income * 100) / 100,
        expense: Math.round(data.expense * 100) / 100,
        balance: Math.round((data.income - data.expense) * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getCategoryBreakdown(userId: string, startDate: Date, endDate: Date, type?: string) {
    const where: any = {
      userId,
      date: { gte: startDate, lte: endDate },
    };
    if (type) where.type = type;

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: { category: true },
    });

    const categoryMap = new Map<string, { name: string; color: string; total: number; count: number }>();

    for (const tx of transactions) {
      const catId = tx.categoryId;
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          name: tx.category.name,
          color: tx.category.color,
          total: 0,
          count: 0,
        });
      }
      const entry = categoryMap.get(catId)!;
      entry.total += Number(tx.amount);
      entry.count += 1;
    }

    const results = Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.name,
      color: data.color,
      total: Math.round(data.total * 100) / 100,
      count: data.count,
    }));

    return results.sort((a, b) => b.total - a.total);
  }

  async getDashboardSummary(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [monthlySummary, recentTransactions, savingsGoals, budgets] = await Promise.all([
      this.prisma.transaction.groupBy({
        by: ['type'],
        where: {
          userId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 5,
        include: { category: true },
      }),
      this.prisma.savingsGoal.findMany({
        where: { userId, isCompleted: false },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      this.prisma.budget.findMany({
        where: { userId, isActive: true },
        include: { category: true },
      }),
    ]);

    let monthlyIncome = 0;
    let monthlyExpense = 0;
    for (const s of monthlySummary) {
      if (s.type === 'INCOME') monthlyIncome = Number(s._sum.amount || 0);
      if (s.type === 'EXPENSE') monthlyExpense = Number(s._sum.amount || 0);
    }

    // Check budget alerts
    const budgetAlerts = [];
    for (const budget of budgets) {
      const spent = await this.prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: 'EXPENSE',
          date: { gte: budget.startDate, lte: budget.endDate },
        },
        _sum: { amount: true },
      });
      const spentAmount = Number(spent._sum.amount || 0);
      const budgetAmount = Number(budget.amount);
      const percentage = budgetAmount > 0 ? Math.round((spentAmount / budgetAmount) * 100) : 0;

      if (percentage >= budget.alertAt) {
        budgetAlerts.push({
          budgetId: budget.id,
          categoryName: budget.category.name,
          budgetAmount,
          spent: spentAmount,
          percentage,
          exceeded: percentage >= 100,
        });
      }
    }

    return {
      monthlyIncome,
      monthlyExpense,
      monthlyBalance: monthlyIncome - monthlyExpense,
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        amount: Number(tx.amount),
        type: tx.type,
        description: tx.description,
        date: tx.date,
        categoryName: tx.category.name,
        categoryColor: tx.category.color,
        categoryIcon: tx.category.icon,
      })),
      savingsGoals: savingsGoals.map((g) => ({
        id: g.id,
        name: g.name,
        targetAmount: Number(g.targetAmount),
        currentAmount: Number(g.currentAmount),
        progress: Number(g.targetAmount) > 0
          ? Math.min(100, Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100))
          : 0,
        targetDate: g.targetDate,
      })),
      budgetAlerts,
    };
  }
}
