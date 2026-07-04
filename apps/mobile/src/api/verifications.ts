import api from './client';
import { Verification } from '../types';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';
import { mediaApi } from './media';

export interface VerificationPayload {
  place_id: string;
  status: 'open' | 'closed';
  note?: string;
  imageUri?: string;
}

const getToken = async (key: string) => {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
};

export const verificationsApi = {
  submit: async (data: VerificationPayload) => {
    let imageUrl: string | undefined;

    if (data.imageUri) {
      // Direct Cloudinary upload
      const uploadRes = await mediaApi.upload(data.imageUri);
      imageUrl = uploadRes.data.url;
    }

    const form = new FormData();
    form.append('place_id', data.place_id);
    form.append('status', data.status);
    if (data.note) form.append('note', data.note);
    if (imageUrl) {
      form.append('image_url', imageUrl);
    }

    const token = await getToken('access_token');
    const response = await fetch(`${API_URL}/api/verifications`, {
      method: 'POST',
      body: form,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.statusText}`);
    }
    const result = await response.json();
    return { data: result as { verification: Verification; conflict_detected: boolean } };
  },

  getForPlace: (placeId: string) =>
    api.get<Verification[]>(`/api/verifications/place/${placeId}`),
};
