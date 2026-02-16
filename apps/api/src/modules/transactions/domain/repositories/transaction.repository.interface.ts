import { Transaction } from '../entities/transaction.entity';

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface TransactionFilters {
  userId: string;
  type?: string;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByFilters(filters: TransactionFilters): Promise<PaginatedResult<Transaction>>;
  create(data: {
    userId: string;
    categoryId: string;
    amount: number;
    type: string;
    description?: string;
    date: Date;
    isRecurring?: boolean;
  }): Promise<Transaction>;
  update(id: string, data: Partial<{
    categoryId: string;
    amount: number;
    type: string;
    description: string;
    date: Date;
    isRecurring: boolean;
  }>): Promise<Transaction>;
  delete(id: string): Promise<void>;
  getSummaryByDateRange(userId: string, startDate: Date, endDate: Date): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }>;
  getByCategory(userId: string, startDate: Date, endDate: Date): Promise<{
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    total: number;
    type: string;
  }[]>;
}
