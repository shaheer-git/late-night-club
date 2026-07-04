import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import CustomDialog from '../../src/components/common/CustomDialog';
import { useAuthStore } from '../../src/store/authStore';

WebBrowser.maybeCompleteAuthSession();

// Screen 2 — Phone number entry
// "What's your number?" — India flag + +91 + phone input
// Continue → OTP screen
// Social: Google, Facebook, Apple

export default function LoginScreen() {
  const router = useRouter();
  const { sendOtp, loginGoogle } = useAuth();
  const { setUser } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
  } | null>(null);

  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'dummy_id_waiting_for_user';
  
  const redirectUri = Platform.OS === 'web'
    ? 'http://localhost:8081'
    : makeRedirectUri({ scheme: 'lnc', path: 'google-auth' });

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: clientId,
    iosClientId: clientId,
    androidClientId: clientId,
    redirectUri,
  });

  // Handle Google Auth Response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      const idToken = authentication?.idToken ?? '';
      const accessToken = authentication?.accessToken ?? '';

      if (!idToken) {
        setLoadingGoogle(false);
        setAlertConfig({ visible: true, title: 'Google Auth Error', message: 'No token received from Google.' });
        return;
      }

      setLoading(true);
      loginGoogle(idToken, accessToken)
        .then(({ isNewUser }) => {
          router.replace(isNewUser ? '/(auth)/welcome' : '/(tabs)');
        })
        .catch((e: any) => {
          console.log('Google backend verify error:', e?.response?.data || e.message);
          setAlertConfig({ visible: true, title: 'Google Auth Error', message: e?.response?.data?.detail ?? e.message });
          setLoading(false);
        });
    } else if (response?.type === 'error') {
      setLoadingGoogle(false);
      setAlertConfig({ visible: true, title: 'Google Auth Error', message: response.error?.message ?? 'Login failed' });
    }
  }, [response]);

  const canContinue = phone.trim().length >= 7 && !loading;

  const handleContinue = async () => {
    if (!canContinue) return;
    setLoading(true);
    const fullPhone = `+91${phone.trim()}`;
    try {
      await sendOtp(fullPhone);
      router.push({ pathname: '/(auth)/otp', params: { phone: fullPhone } });
    } catch (error: any) {
      console.log('Login error:', error?.response?.data || error.message);
      const msg = error?.response?.data?.detail ?? error.message ?? 'An error occurred';
      setAlertConfig({ visible: true, title: 'OTP Failed', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!request) {
      setAlertConfig({ visible: true, title: 'Error', message: 'Google Login is not fully initialized yet.' });
      return;
    }
    setLoadingGoogle(true);
    promptAsync();
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconWrap}>
              <Image
                source={require('../../assets/images/auth/Login-Screen-Icon.png')}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>

            {/* Heading */}
            <Text style={styles.heading}>What's your number?</Text>

            {/* Phone row */}
            <View style={styles.phoneRow}>
              <TouchableOpacity style={styles.countryPicker}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Ionicons name="chevron-down" size={14} color="#2C2C2C" />
              </TouchableOpacity>

              <View style={styles.phoneInput}>
                <Text style={styles.dialCode}>+91</Text>
                <TextInput
                  style={styles.phoneText}
                  placeholder="Enter Phone Number"
                  placeholderTextColor="rgba(44,44,44,0.4)"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={10}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Continue */}
            <TouchableOpacity
              style={[styles.btn, !canContinue && styles.btnDisabled]}
              onPress={handleContinue}
              disabled={!canContinue}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#2C2C2C" />
              ) : (
                <Text style={styles.btnText}>Continue</Text>
              )}
            </TouchableOpacity>

            {/* Social login */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleLogin} disabled={loading}>
                <Text style={styles.socialG}>G</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={styles.socialBtn}>
                <Text style={styles.socialF}>f</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-apple" size={26} color="#2C2C2C" />
              </TouchableOpacity> */}
            </View>

          </ScrollView>
        </KeyboardAvoidingView>

        {/* Step dots — dot 1 active (Login step) */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </SafeAreaView>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#2C2C2C' },
  safe: { flex: 1 },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 24,
  },

  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconWrap: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  icon: {
    width: 140,
    height: 140,
  },

  heading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  phoneRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 56,
    gap: 6,
  },
  flag: { fontSize: 22 },
  phoneInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    gap: 8,
  },
  dialCode: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#2C2C2C',
  },
  phoneText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#2C2C2C',
    padding: 0,
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

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 4,
  },
  socialBtn: {
    width: 68,
    height: 68,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialG: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    color: '#2C2C2C',
  },
  socialF: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
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
