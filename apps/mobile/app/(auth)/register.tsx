import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { useLocationStore } from '../../src/store/locationStore';
import { RegisterIcon } from '../../src/components/icons/AuthIcons';

// Screen 4 — Name collection (new users only)
// Stacked bowls icon, Name + Last Name inputs, Terms checkbox
// Continue → welcome/home, "Do you have account? Sign In" link

export default function RegisterScreen() {
  const router = useRouter();
  const { phone, otp } = useLocalSearchParams<{ phone: string; otp: string }>();
  const { register } = useAuth();
  const { city } = useLocationStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const canContinue = firstName.trim().length > 0 && lastName.trim().length > 0 && agreed;

  const handleContinue = async () => {
    if (!canContinue) return;
    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const email = phone
        ? `${phone.replace(/\D/g, '')}@lnc.app`
        : `${Date.now()}@lnc.app`;
      await register(fullName, email, otp ?? '0000', city || null);
      router.replace('/(auth)/welcome');
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? 'Registration failed. Please try again.';
      Alert.alert('Sign Up Failed', msg);
      router.replace('/(auth)/welcome');
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
              <RegisterIcon size={130} />
            </View>

            {/* Name */}
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputText}
                placeholder="Name"
                placeholderTextColor="rgba(44,44,44,0.45)"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputText}
                placeholder="Last Name"
                placeholderTextColor="rgba(44,44,44,0.45)"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreed(v => !v)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Ionicons name="checkmark" size={13} color="#2C2C2C" />}
              </View>
              <Text style={styles.termsText}>
                I'm agree to The{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Continue */}
            <TouchableOpacity
              style={[styles.btn, !canContinue && styles.btnDisabled]}
              onPress={handleContinue}
              disabled={!canContinue || loading}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>
                {loading ? 'Creating account...' : 'Continue'}
              </Text>
            </TouchableOpacity>

            {/* Sign In link */}
            <TouchableOpacity
              style={styles.signInRow}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.signInText}>
                Do you have account?{' '}
                <Text style={styles.signInLink}>Sign In</Text>
              </Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>

        {/* Step dots — dot 3 active (Register step) */}
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
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
    gap: 16,
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

  inputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  inputText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#2C2C2C',
    padding: 0,
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#C6FF34',
    borderColor: '#C6FF34',
  },
  termsText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
  },
  termsLink: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },

  btn: {
    height: 68,
    backgroundColor: '#C6FF34',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#2C2C2C',
  },

  signInRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  signInText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  signInLink: {
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
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
