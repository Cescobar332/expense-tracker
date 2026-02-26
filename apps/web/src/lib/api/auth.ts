import { api, apiRequest } from './client';
import { AuthResponse, User } from '../../types';

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; currency?: string }) =>
    apiRequest<User>('/auth/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string }) =>
    apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: data }),

  refresh: (refreshToken: string) =>
    apiRequest<AuthResponse>('/auth/refresh', { method: 'POST', body: { refreshToken } }),

  getProfile: () => api.get<User>('/users/profile'),

  updateProfile: (data: { firstName?: string; lastName?: string; currency?: string; language?: string }) =>
    api.patch<User>('/users/profile', data),

  updateCurrency: (newCurrency: string) =>
    api.patch<{ user: User; convertedCounts: { transactions: number; budgets: number; savings: number } }>(
      '/users/currency',
      { newCurrency },
    ),
};
