import { Stack } from 'expo-router';

// Auth flow: welcome → login (phone) → otp → register (name)
// Each step slides in from the right for a wizard feel

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="login"   options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="otp"     options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
