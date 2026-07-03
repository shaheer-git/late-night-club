import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

const getToken = async (key: string) => {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
};

export const mediaApi = {
  upload: async (form: FormData) => {
    const token = await getToken('access_token');
    const response = await fetch(`${API_URL}/api/media/upload`, {
      method: 'POST',
      body: form,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      let msg = response.statusText;
      try {
        const errData = await response.json();
        msg = errData.detail || msg;
      } catch (e) {}
      throw new Error(`Upload failed: ${msg}`);
    }
    const data = await response.json();
    return { data };
  },
};
