import { api } from './client';
import { SavingsGoal } from '../../types';

export const savingsApi = {
  getAll: () => api.get<SavingsGoal[]>('/savings'),

  getById: (id: string) => api.get<SavingsGoal>(`/savings/${id}`),

  create: (data: { name: string; targetAmount: number; targetDate?: string }) =>
    api.post<SavingsGoal>('/savings', data),

  update: (id: string, data: Partial<{ name: string; targetAmount: number; targetDate: string }>) =>
    api.patch<SavingsGoal>(`/savings/${id}`, data),

  addAmount: (id: string, amount: number) =>
    api.post<SavingsGoal>(`/savings/${id}/add`, { amount }),

  delete: (id: string) => api.delete<void>(`/savings/${id}`),
};
