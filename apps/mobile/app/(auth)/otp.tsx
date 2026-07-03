import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';

// Screen 3 — OTP verification
// Hash/grid icon, "We've sent a 4 digit code to your number"
// 4 dark boxes (filled lime when entered), Resend OTP, Continue

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  const refs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleChange = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val.slice(-1);
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
      const { registered } = await verifyOtp(phone, otp.join(''));
      if (registered) {
        // Returning user — go straight to home, skip welcome screen
        router.replace('/(tabs)');
      } else {
        // New user — collect their name first
        router.push({ pathname: '/(auth)/register', params: { phone, otp: otp.join('') } });
      }
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e.message ?? 'Invalid or expired OTP. Please try again.';
      Alert.alert('Verification Failed', msg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconWrap}>
            <Image
              source={require('../../assets/images/auth/Otp-Screen-Icon.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>

          {/* Heading */}
          <Text style={styles.heading}>
            We've sent a 4 digit code{'\n'}to your number
          </Text>

          {/* OTP boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={refs[idx]}
                style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                value={digit}
                onChangeText={v => handleChange(v, idx)}
                onKeyPress={e => handleKey(e, idx)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectionColor="#C6FF34"
              />
            ))}
          </View>

          {/* Resend */}
          <Text style={styles.resend}>
            Didn't get OTP?{' '}
            <Text style={styles.resendLink}>Resend OTP</Text>
          </Text>

          <View style={{ flex: 1 }} />

          {/* Continue */}
          <View style={styles.btnWrap}>
            <TouchableOpacity
              style={[styles.btn, (!isComplete || loading) && styles.btnDisabled]}
              onPress={handleVerify}
              disabled={!isComplete || loading}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>
                {loading ? 'Verifying...' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>

        {/* Step dots — dot 2 active (OTP step) */}
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#2C2C2C' },
  safe: { flex: 1 },

  backBtn: {
    marginTop: 16,
    marginLeft: 24,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconWrap: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 32,
  },
  icon: {
    width: 130,
    height: 130,
  },

  heading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.3,
    paddingHorizontal: 24,
  },

  otpRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 32,
    gap: 12,
  },
  otpBox: {
    flex: 1,
    height: 72,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: '#FFFFFF',
  },
  otpBoxFilled: {
    backgroundColor: '#C6FF34',
    color: '#2C2C2C',
  },

  resend: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  resendLink: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },

  btnWrap: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  btn: {
    height: 68,
    backgroundColor: '#C6FF34',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#2C2C2C',
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  dot: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: { backgroundColor: '#FFFFFF' },
});
