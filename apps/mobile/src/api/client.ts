import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

const getToken = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
};

const setToken = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
  return SecureStore.setItemAsync(key, value);
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

console.log('==== DEBUG: Axios API_URL is set to:', API_URL, '====');

api.interceptors.request.use(async (config) => {
  const token = await getToken('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = await getToken('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_URL}/api/auth/refresh`, { refresh_token: refresh });
          await setToken('access_token', res.data.access_token);
          original.headers.Authorization = `Bearer ${res.data.access_token}`;
          return api(original);
        } catch {
          // refresh failed — let caller handle
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
