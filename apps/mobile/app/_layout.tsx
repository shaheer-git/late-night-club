import '../global.css';
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../src/store/authStore';
import { usersApi } from '../src/api/users';

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, setUser } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token =
          Platform.OS === 'web'
            ? localStorage.getItem('access_token')
            : await SecureStore.getItemAsync('access_token');
        if (token) {
          const { data } = await usersApi.getMe();
          setUser(data);
        }
      } catch {}
      setChecked(true);
    })();
  }, []);

  useEffect(() => {
    if (!checked) return;
    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const inSplash = segments[0] === 'index' || segments.length === 0;
    if (!isAuthenticated && !inAuth && !inOnboarding && !inSplash) {
      router.replace('/(auth)/login');
    }
  }, [checked, isAuthenticated, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="place" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="search" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
          </Stack>
        </AuthGate>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
