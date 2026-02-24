import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma.service';
import { USER_REPOSITORY, IUserRepository } from '../../domain/repositories/user.repository.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChangeCurrencyUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(userId: string, newCurrency: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new BadRequestException('Usuario no encontrado');

    const oldCurrency = user.currency;
    if (oldCurrency === newCurrency) {
      throw new BadRequestException('La nueva moneda es igual a la actual');
    }

    const rate = await this.fetchExchangeRate(oldCurrency, newCurrency);

    const result = await this.prisma.$transaction(async (tx) => {
      // Convert all transactions
      const transactions = await tx.transaction.findMany({
        where: { userId },
        select: { id: true, amount: true },
      });

      for (const t of transactions) {
        const converted = Number(t.amount) * rate;
        await tx.transaction.update({
          where: { id: t.id },
          data: { amount: new Prisma.Decimal(converted.toFixed(2)) },
        });
      }

      // Convert all budgets
      const budgets = await tx.budget.findMany({
        where: { userId },
        select: { id: true, amount: true },
      });

      for (const b of budgets) {
        const converted = Number(b.amount) * rate;
        await tx.budget.update({
          where: { id: b.id },
          data: { amount: new Prisma.Decimal(converted.toFixed(2)) },
        });
      }

      // Convert all savings goals (target and current)
      const savings = await tx.savingsGoal.findMany({
        where: { userId },
        select: { id: true, targetAmount: true, currentAmount: true },
      });

      for (const s of savings) {
        const convertedTarget = Number(s.targetAmount) * rate;
        const convertedCurrent = Number(s.currentAmount) * rate;
        await tx.savingsGoal.update({
          where: { id: s.id },
          data: {
            targetAmount: new Prisma.Decimal(convertedTarget.toFixed(2)),
            currentAmount: new Prisma.Decimal(convertedCurrent.toFixed(2)),
          },
        });
      }

      // Update user currency
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { currency: newCurrency },
      });

      return {
        user: updatedUser,
        counts: {
          transactions: transactions.length,
          budgets: budgets.length,
          savings: savings.length,
        },
      };
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        currency: result.user.currency,
      },
      convertedCounts: result.counts,
    };
  }

  private async fetchExchangeRate(from: string, to: string): Promise<number> {
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${from}`,
      );
      if (!response.ok) {
        throw new BadRequestException('No se pudo obtener el tipo de cambio');
      }
      const data = await response.json();
      const rate = data.rates?.[to];
      if (!rate) {
        throw new BadRequestException(`Moneda no soportada: ${to}`);
      }
      return rate;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        'Error al obtener el tipo de cambio. Intenta de nuevo.',
      );
    }
  }
}
