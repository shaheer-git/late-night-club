import { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';

const ONBOARDING_KEY = 'lnc_onboarding_done_v2';

export default function SplashScreen() {
  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo fade + scale
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
    ]).start();

    // Loader rotation loop
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();

    const navigate = async () => {
      const done = await SecureStore.getItemAsync(ONBOARDING_KEY);
      router.replace(done ? '/(tabs)' : '/onboarding/city-select');
    };

    const t = setTimeout(navigate, 2500);
    return () => clearTimeout(t);
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Logo + tagline */}
      <Animated.View style={[styles.logoWrap, { opacity: fade, transform: [{ scale }] }]}>
        <Image
          source={require('../assets/images/lnc-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Animated loader */}
      <Animated.View style={[styles.loaderWrap, { opacity: fade, transform: [{ rotate: spin }] }]}>
        <Image
          source={require('../assets/images/loader.png')}
          style={styles.loader}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    width: 137,
    height: 132,
  },
  loaderWrap: {
    position: 'absolute',
    bottom: 100,
  },
  loader: {
    width: 64,
    height: 64,
  },
});
