import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Image, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../src/hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const canContinue = email.trim().length > 0;

  const handleLogin = async () => {
    if (!canContinue) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? 'Login failed. Check your credentials.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-dark">
      <StatusBar style="light" />
      <View className="absolute top-[129px] left-[115px] w-[162px] h-[161px] rounded-full bg-purple/5" />

      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <TouchableOpacity
            className="absolute top-[10px] left-[10px] w-11 h-11 bg-white/10 rounded-lg items-center justify-center z-10"
            onPress={() => router.back()}
          >
            <Text className="text-white text-xl">←</Text>
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={{ paddingTop: '35%', paddingHorizontal: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="font-bold text-[28px] text-white leading-10 mb-6">
              Welcome back
            </Text>

            <View className="gap-4">
              {/* Email */}
              <View className="flex-row items-center bg-white rounded-lg px-4 h-[58px]">
                <TextInput
                  className="flex-1 font-regular text-[16px] text-dark"
                  placeholder="Email"
                  placeholderTextColor="#2C2C2C"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Password */}
              <View className="flex-row items-center bg-white rounded-lg px-4 h-[58px]">
                <TextInput
                  className="flex-1 font-regular text-[16px] text-dark"
                  placeholder="Password"
                  placeholderTextColor="#2C2C2C"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Login button */}
              <TouchableOpacity
                className={`h-[68px] bg-lime rounded-lg items-center justify-center ${
                  (!canContinue || loading) ? 'opacity-50' : ''
                }`}
                onPress={handleLogin}
                disabled={!canContinue || loading}
              >
                <Text className="font-semibold text-[16px] text-dark">
                  {loading ? 'Signing in...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center gap-2">
                <View className="flex-1 h-px bg-white/50" />
                <Text className="font-regular text-[14px] text-white/50">Or</Text>
                <View className="flex-1 h-px bg-white/50" />
              </View>

              {/* Google button */}
              <TouchableOpacity className="h-[58px] items-center justify-center">
                <Image
                  source={require('../../assets/images/google-btn.png')}
                  className="w-[295px] h-[58px]"
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {/* Register link */}
              <TouchableOpacity
                className="items-center py-3"
                onPress={() => router.push('/(auth)/register')}
              >
                <Text className="font-regular text-[14px] text-white/50">
                  Don't have an account?{' '}
                  <Text className="text-white font-medium">Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View className="absolute bottom-[10%] self-center">
          <Image
            source={require('../../assets/images/lnc-logo.png')}
            className="w-20 h-20"
            resizeMode="contain"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
