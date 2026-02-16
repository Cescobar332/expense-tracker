import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma.service';
import { ISavingsGoalRepository } from '../../domain/repositories/savings-goal.repository.interface';
import { SavingsGoal } from '../../domain/entities/savings-goal.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaSavingsGoalRepository implements ISavingsGoalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SavingsGoal | null> {
    const sg = await this.prisma.savingsGoal.findUnique({ where: { id } });
    return sg ? this.toDomain(sg) : null;
  }

  async findByUserId(userId: string): Promise<SavingsGoal[]> {
    const goals = await this.prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return goals.map((g) => this.toDomain(g));
  }

  async create(data: {
    userId: string;
    name: string;
    targetAmount: number;
    targetDate?: Date;
  }): Promise<SavingsGoal> {
    const sg = await this.prisma.savingsGoal.create({
      data: {
        userId: data.userId,
        name: data.name,
        targetAmount: new Prisma.Decimal(data.targetAmount),
        targetDate: data.targetDate || null,
      },
    });
    return this.toDomain(sg);
  }

  async update(id: string, data: Partial<{
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: Date | null;
    isCompleted: boolean;
  }>): Promise<SavingsGoal> {
    const updateData: any = { ...data };
    if (data.targetAmount !== undefined) updateData.targetAmount = new Prisma.Decimal(data.targetAmount);
    if (data.currentAmount !== undefined) updateData.currentAmount = new Prisma.Decimal(data.currentAmount);
    const sg = await this.prisma.savingsGoal.update({ where: { id }, data: updateData });
    return this.toDomain(sg);
  }

  async addAmount(id: string, amount: number): Promise<SavingsGoal> {
    const goal = await this.prisma.savingsGoal.findUnique({ where: { id } });
    if (!goal) throw new Error('Savings goal not found');

    const newAmount = Number(goal.currentAmount) + amount;
    const isCompleted = newAmount >= Number(goal.targetAmount);

    const sg = await this.prisma.savingsGoal.update({
      where: { id },
      data: {
        currentAmount: new Prisma.Decimal(Math.max(0, newAmount)),
        isCompleted,
      },
    });
    return this.toDomain(sg);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.savingsGoal.delete({ where: { id } });
  }

  private toDomain(raw: any): SavingsGoal {
    return new SavingsGoal({
      id: raw.id,
      userId: raw.userId,
      name: raw.name,
      targetAmount: raw.targetAmount,
      currentAmount: raw.currentAmount,
      targetDate: raw.targetDate,
      isCompleted: raw.isCompleted,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
