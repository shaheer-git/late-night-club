import api from './client';
import { User } from '../types';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; password: string; }
export interface AuthTokens { access_token: string; refresh_token: string; }

export const authApi = {
  login: (data: LoginPayload) =>
    api.post<AuthTokens & { user: User }>('/api/auth/login', data),

  register: (data: RegisterPayload) =>
    api.post<AuthTokens & { user: User }>('/api/auth/register', data),

  refresh: (refresh_token: string) =>
    api.post<{ access_token: string }>('/api/auth/refresh', { refresh_token }),

  logout: () => api.post('/api/auth/logout'),

  saveFcmToken: (fcm_token: string) =>
    api.post('/api/auth/fcm-token', { fcm_token }),
};
