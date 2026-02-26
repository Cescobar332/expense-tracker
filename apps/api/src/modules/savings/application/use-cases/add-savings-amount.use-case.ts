import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AddSavingsAmountUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, savingsGoalId: string, amount: number) {
    // Find the savings goal
    const goal = await this.prisma.savingsGoal.findUnique({
      where: { id: savingsGoalId },
    });
    if (!goal || goal.userId !== userId) {
      throw new Error('Meta de ahorro no encontrada');
    }

    // Find the "Ahorro" category for this user
    let ahorroCategory = await this.prisma.category.findFirst({
      where: { userId, name: 'Ahorro', type: 'EXPENSE' },
    });

    // If no "Ahorro" category, create it
    if (!ahorroCategory) {
      ahorroCategory = await this.prisma.category.create({
        data: {
          userId,
          name: 'Ahorro',
          type: 'EXPENSE',
          color: '#f59e0b',
          icon: 'PiggyBank',
          isDefault: true,
        },
      });
    }

    // Execute atomically: create expense transaction + update savings goal
    const newCurrentAmount = Number(goal.currentAmount) + amount;
    const isCompleted = newCurrentAmount >= Number(goal.targetAmount);

    const [transaction, updatedGoal] = await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          userId,
          categoryId: ahorroCategory.id,
          amount: new Prisma.Decimal(amount),
          type: 'EXPENSE',
          description: `Ahorro: ${goal.name}`,
          date: new Date(),
        },
      }),
      this.prisma.savingsGoal.update({
        where: { id: savingsGoalId },
        data: {
          currentAmount: new Prisma.Decimal(Math.max(0, newCurrentAmount)),
          isCompleted,
        },
      }),
    ]);

    return {
      transaction,
      savingsGoal: updatedGoal,
    };
  }
}
