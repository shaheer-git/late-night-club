import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { TitanOne_400Regular } from '@expo-google-fonts/titan-one';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { usersApi } from '../src/api/users';

SplashScreen.preventAutoHideAsync();

/** Silently restore auth session if a token exists — no redirect on failure */
function AuthRestorer({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuthStore();

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
    })();
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    TitanOne_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <ThemeProvider value={DarkTheme}>
          <AuthRestorer>
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="place" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="search" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="add-place" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="profile-settings" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="my-contributions" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="general-settings" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="help-support" options={{ animation: 'slide_from_right' }} />
            </Stack>
          </AuthRestorer>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
