import { api } from './client';
import { Transaction, TransactionFilters } from '../../types';

export const transactionsApi = {
  getAll: (filters?: TransactionFilters) => {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.categoryId) params.set('categoryId', filters.categoryId);
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    const qs = params.toString();
    return api.get<Transaction[]>(`/transactions${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => api.get<Transaction>(`/transactions/${id}`),

  create: (data: {
    amount: number;
    categoryId: string;
    type: 'INCOME' | 'EXPENSE';
    date: string;
    description?: string;
    isRecurring?: boolean;
  }) => api.post<Transaction>('/transactions', data),

  update: (id: string, data: Partial<{
    amount: number;
    categoryId: string;
    type: 'INCOME' | 'EXPENSE';
    date: string;
    description: string;
    isRecurring: boolean;
  }>) => api.patch<Transaction>(`/transactions/${id}`, data),

  delete: (id: string) => api.delete<void>(`/transactions/${id}`),
};
