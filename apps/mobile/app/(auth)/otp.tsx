import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../src/hooks/useAuth';

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const refs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];

  const handleChange = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 3) refs[idx + 1].current?.focus();
  };

  const handleKey = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  };

  const isComplete = otp.every(d => d !== '');

  const handleVerify = async () => {
    if (!isComplete) return;
    setLoading(true);
    try {
      await login(`${phone}@lnc.app`, otp.join(''));
      router.replace('/(auth)/welcome');
    } catch {
      router.replace('/(auth)/welcome');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-dark">
      <StatusBar style="light" />

      {/* BG decorations */}
      <View className="absolute top-[129px] left-[115px] w-[162px] h-[161px] rounded-full bg-purple/8" />
      <View className="absolute top-[129px] left-[115px] w-[161px] h-[161px] rounded-full bg-purple/5" />

      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Back */}
          <TouchableOpacity
            className="absolute top-[10px] left-[10px] w-11 h-11 bg-white/10 rounded-lg items-center justify-center z-10"
            onPress={() => router.back()}
          >
            <Text className="text-white text-xl">←</Text>
          </TouchableOpacity>

          <View className="absolute top-[41.6%] left-[22px] right-[22px] items-center gap-[14px]">
            <Text className="font-bold text-[28px] text-white text-center leading-10 w-[320px]">
              We've sent a 4 digit code to your number
            </Text>

            {/* OTP boxes */}
            <View className="flex-row w-[342px] justify-between">
              {otp.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={refs[idx]}
                  className={`w-[70px] h-[70px] rounded-md text-center text-[28px] font-semibold border ${
                    digit
                      ? 'bg-lime border-lime text-dark'
                      : 'bg-white/10 border-white/20 text-white'
                  }`}
                  value={digit}
                  onChangeText={v => handleChange(v.slice(-1), idx)}
                  onKeyPress={e => handleKey(e, idx)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                />
              ))}
            </View>

            {/* Resend */}
            <Text className="font-regular text-[14px] text-white/50 w-full text-left">
              Didn't get OTP?{' '}
              <Text className="text-white font-medium">Resend OTP</Text>
            </Text>

            {/* Continue */}
            <TouchableOpacity
              className={`w-[342px] h-[68px] bg-lime rounded-lg items-center justify-center ${
                (!isComplete || loading) ? 'opacity-50' : ''
              }`}
              onPress={handleVerify}
              disabled={!isComplete || loading}
            >
              <Text className="font-semibold text-[16px] text-dark">
                {loading ? 'Verifying...' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
