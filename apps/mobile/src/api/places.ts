import api from './client';
import { Place, NearbyPlacesParams } from '../types';

export interface PlacesResponse { total: number; items: Place[]; }

export const placesApi = {
  getNearby: (params: NearbyPlacesParams) =>
    api.get<PlacesResponse>('/api/places', { params }),

  getById: (id: string) =>
    api.get<Place>(`/api/places/${id}`),

  search: (q: string, lat: number, lng: number) =>
    api.get<PlacesResponse>('/api/places/search', { params: { q, lat, lng } }),

  create: (data: FormData) =>
    api.post<Place>('/api/places', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: Partial<Place>) =>
    api.patch<Place>(`/api/places/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/places/${id}`),
};
