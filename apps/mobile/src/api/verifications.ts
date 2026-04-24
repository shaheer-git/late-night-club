import api from './client';
import { Verification } from '../types';

export interface VerificationPayload {
  place_id: string;
  status: 'open' | 'closed';
  note?: string;
}

export const verificationsApi = {
  submit: (data: VerificationPayload) =>
    api.post<{ verification: Verification; conflict_detected: boolean }>('/api/verifications', data),

  getForPlace: (placeId: string) =>
    api.get<Verification[]>(`/api/verifications/place/${placeId}`),
};
