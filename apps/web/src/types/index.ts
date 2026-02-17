export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  currency: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
  icon?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  date: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: string;
  endDate: string;
  alertAt: number;
  isActive: boolean;
  spent?: number;
  percentage?: number;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsTotal: number;
}

export interface ReportData {
  summary: DashboardSummary;
  byCategory: { categoryId: string; categoryName: string; color: string; total: number; percentage: number }[];
  trend: { date: string; income: number; expenses: number }[];
}

export interface TransactionFilters {
  type?: 'INCOME' | 'EXPENSE';
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
