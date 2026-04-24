import api from './client';

export const mediaApi = {
  upload: (form: FormData) =>
    api.post<{ url: string }>('/api/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
