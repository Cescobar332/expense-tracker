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
};
