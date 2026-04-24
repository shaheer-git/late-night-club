import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../src/hooks/useAuth';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const canContinue = name.trim() && email.trim()  && agreed;

  const handleContinue = async () => {
    if (!canContinue) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? 'Registration failed. Please try again.';
      Alert.alert('Sign Up Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-dark">
      <StatusBar style="light" />
      <View className="absolute top-[129px] left-[115px] w-[161px] h-[161px] rounded-full bg-purple/5" />

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
            contentContainerStyle={{ paddingTop: '30%', paddingHorizontal: 23 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="font-bold text-[28px] text-white leading-10 mb-6">
              Create account
            </Text>

            <View className="gap-[16px]">
              {/* Name */}
              <View className="flex-row items-center bg-white rounded-md px-4 h-[58px]">
                <TextInput
                  className="flex-1 font-regular text-[16px] text-dark"
                  placeholder="Full Name"
                  placeholderTextColor="#2C2C2C"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              {/* Email */}
              <View className="flex-row items-center bg-white rounded-md px-4 h-[58px]">
                <TextInput
                  className="flex-1 font-regular text-[16px] text-dark"
                  placeholder="Email"
                  placeholderTextColor="#2C2C2C"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password */}
              <View className="flex-row items-center bg-white rounded-md px-4 h-[58px]">
                <TextInput
                  className="flex-1 font-regular text-[16px] text-dark"
                  placeholder="Password (min 6 characters)"
                  placeholderTextColor="#2C2C2C"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Terms */}
              <TouchableOpacity
                className="flex-row gap-[14px] items-start"
                onPress={() => setAgreed(!agreed)}
              >
                <View className={`w-6 h-6 rounded border-2 items-center justify-center ${
                  agreed ? 'bg-lime border-lime' : 'border-white/50'
                }`}>
                  {agreed && <Text className="text-dark text-xs font-bold">✓</Text>}
                </View>
                <Text className="flex-1 font-regular text-[12px] text-white/50 leading-[22px]">
                  I agree to the{' '}
                  <Text className="text-white">Terms of Service</Text>
                  {' '}and{' '}
                  <Text className="text-white">Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Continue */}
              <TouchableOpacity
                className={`h-[68px] bg-lime rounded-lg items-center justify-center ${
                  (!canContinue || loading) ? 'opacity-50' : ''
                }`}
                onPress={handleContinue}
                disabled={!canContinue || loading}
              >
                <Text className="font-semibold text-[16px] text-dark">
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center py-2"
                onPress={() => router.push('/(auth)/login')}
              >
                <Text className="font-regular text-[14px] text-white/50">
                  Already have an account?{' '}
                  <Text className="text-white font-medium">Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
