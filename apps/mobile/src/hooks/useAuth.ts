import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { usersApi } from '../api/users';

const saveToken = async (key: string, val: string) => {
  if (Platform.OS === 'web') { localStorage.setItem(key, val); return; }
  return SecureStore.setItemAsync(key, val);
};

const removeToken = async (key: string) => {
  if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
  return SecureStore.deleteItemAsync(key);
};

export function useAuth() {
  const { user, isAuthenticated, setUser, logout: clearUser } = useAuthStore();

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    await saveToken('access_token', data.access_token);
    await saveToken('refresh_token', data.refresh_token);
    setUser(data.user);
  };

  const sendOtp = async (phone: string) => {
    await authApi.sendOtp(phone);
  };

  const verifyOtp = async (phone: string, code: string) => {
    const { data } = await authApi.verifyOtp(phone, code);
    if (data.registered && data.tokens) {
      await saveToken('access_token', data.tokens.access_token);
      await saveToken('refresh_token', data.tokens.refresh_token);
      setUser(data.tokens.user);
    }
    return { registered: data.registered };
  };

  const loginGoogle = async (idToken: string, accessToken?: string) => {
    const { data } = await authApi.loginWithGoogle(idToken, accessToken);
    await saveToken('access_token', data.access_token);
    await saveToken('refresh_token', data.refresh_token);
    setUser(data.user);
    return { isNewUser: data.is_new_user ?? false };
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await authApi.register({ name, email, password });
    await saveToken('access_token', data.access_token);
    await saveToken('refresh_token', data.refresh_token);
    setUser(data.user);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    await removeToken('access_token');
    await removeToken('refresh_token');
    clearUser();
  };

  const restoreSession = async () => {
    try {
      const { data } = await usersApi.getMe();
      setUser(data);
      return true;
    } catch {
      return false;
    }
  };

  return { user, isAuthenticated, login, register, logout, restoreSession, sendOtp, verifyOtp, loginGoogle };
}

