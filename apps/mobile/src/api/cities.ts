import api from './client';
import { City } from '../types';

export const citiesApi = {
  getAll: () => api.get<City[]>('/api/cities'),
  search: (q: string) => api.get<City[]>('/api/cities/search', { params: { q } }),
};
