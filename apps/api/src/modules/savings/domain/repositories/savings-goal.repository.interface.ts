import { SavingsGoal } from '../entities/savings-goal.entity';

export const SAVINGS_GOAL_REPOSITORY = Symbol('SAVINGS_GOAL_REPOSITORY');

export interface ISavingsGoalRepository {
  findById(id: string): Promise<SavingsGoal | null>;
  findByUserId(userId: string): Promise<SavingsGoal[]>;
  create(data: {
    userId: string;
    name: string;
    targetAmount: number;
    targetDate?: Date;
  }): Promise<SavingsGoal>;
  update(id: string, data: Partial<{
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: Date | null;
    isCompleted: boolean;
  }>): Promise<SavingsGoal>;
  addAmount(id: string, amount: number): Promise<SavingsGoal>;
  delete(id: string): Promise<void>;
}
