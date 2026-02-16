import { Budget } from '../entities/budget.entity';

export const BUDGET_REPOSITORY = Symbol('BUDGET_REPOSITORY');

export interface BudgetWithSpent extends Budget {
  spent: number;
  percentage: number;
}

export interface IBudgetRepository {
  findById(id: string): Promise<Budget | null>;
  findByUserId(userId: string, activeOnly?: boolean): Promise<Budget[]>;
  create(data: {
    userId: string;
    categoryId: string;
    amount: number;
    period: string;
    startDate: Date;
    endDate: Date;
    alertAt?: number;
  }): Promise<Budget>;
  update(id: string, data: Partial<{
    amount: number;
    period: string;
    startDate: Date;
    endDate: Date;
    alertAt: number;
    isActive: boolean;
  }>): Promise<Budget>;
  delete(id: string): Promise<void>;
  getBudgetsWithSpent(userId: string): Promise<BudgetWithSpent[]>;
}
