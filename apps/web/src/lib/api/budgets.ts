import { api } from './client';
import { Budget } from '../../types';

export const budgetsApi = {
  getAll: () => api.get<Budget[]>('/budgets'),

  getById: (id: string) => api.get<Budget>(`/budgets/${id}`),

  create: (data: {
    amount: number;
    categoryId: string;
    period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    startDate: string;
    endDate: string;
    alertAt?: number;
  }) => api.post<Budget>('/budgets', data),

  update: (id: string, data: Partial<{
    amount: number;
    period: string;
    startDate: string;
    endDate: string;
    alertAt: number;
    isActive: boolean;
  }>) => api.patch<Budget>(`/budgets/${id}`, data),

  delete: (id: string) => api.delete<void>(`/budgets/${id}`),
};
