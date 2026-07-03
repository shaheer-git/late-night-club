import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// Screen 2 — Phone number entry
// "What's your number?" — India flag + +91 + phone input
// Continue → OTP screen
// Social: Google, Facebook, Apple

export default function LoginScreen() {
  const router = useRouter();
  const { sendOtp, loginGoogle } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'dummy_id_waiting_for_user';
  
  // Explicitly set the redirect URI so Google accepts it.
  // On web (browser testing) → http://localhost:8081 (must match Google Console exactly)
  // On native → uses the app scheme lnc://
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
      // Web flow gives access_token; native flow gives idToken
      const idToken = authentication?.idToken ?? '';
      const accessToken = authentication?.accessToken ?? '';

      if (!idToken && !accessToken) {
        Alert.alert('Google Auth Error', 'No token received from Google.');
        return;
      }

      setLoading(true);
      loginGoogle(idToken, accessToken)
        .then(({ isNewUser }) => {
          // New users see welcome screen; returning users go straight to home
          router.replace(isNewUser ? '/(auth)/welcome' : '/(tabs)');
        })
        .catch((e: any) => {
          Alert.alert('Google Auth Error', e?.response?.data?.detail ?? e.message);
          setLoading(false);
        });
    } else if (response?.type === 'error') {
      Alert.alert('Google Auth Error', response.error?.message ?? 'Login failed');
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
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e?.message ?? 'Failed to send OTP. Please check your connection.';
      Alert.alert('OTP Failed', msg);
      // For developer testing fallback, let them proceed anyway
      router.push({ pathname: '/(auth)/otp', params: { phone: fullPhone } });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!request) {
      Alert.alert('Error', 'Google Login is not fully initialized yet.');
      return;
    }
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
