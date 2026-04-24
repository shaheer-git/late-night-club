import api from './client';
import { User, Place, Verification } from '../types';

export const usersApi = {
  getMe: () => api.get<User>('/api/users/me'),
  updateMe: (data: Partial<User>) => api.patch<User>('/api/users/me', data),
  getMyContributions: () => api.get<Place[]>('/api/users/me/contributions'),
  getMyVerifications: () => api.get<Verification[]>('/api/users/me/verifications'),
  uploadAvatar: (form: FormData) =>
    api.post<{ avatar_url: string }>('/api/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
