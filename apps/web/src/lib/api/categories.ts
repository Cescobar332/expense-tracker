import { api } from './client';
import { Category } from '../../types';

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories'),

  getById: (id: string) => api.get<Category>(`/categories/${id}`),

  create: (data: { name: string; type: 'INCOME' | 'EXPENSE'; color?: string; icon?: string }) =>
    api.post<Category>('/categories', data),

  update: (id: string, data: Partial<{ name: string; color: string; icon: string }>) =>
    api.patch<Category>(`/categories/${id}`, data),

  delete: (id: string) => api.delete<void>(`/categories/${id}`),
};
