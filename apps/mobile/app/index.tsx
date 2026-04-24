import { useEffect, useRef } from 'react';
import { View, Image, Text, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function SplashScreen() {
  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => router.replace('/onboarding/city-select'), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <StatusBar style="dark" />

      <Animated.View
        className="items-center"
        style={{ opacity: fade, transform: [{ scale }] }}
      >
        {/* Logo */}
        <Image
          source={require('../assets/images/lnc-logo.png')}
          className="w-[137px] h-[132px]"
          resizeMode="contain"
        />

        {/* Tagline */}
        <View className="px-[10px] py-[10px] items-center">
          <Text className="font-medium text-[15px] leading-5 tracking-tight text-dark text-center">
            {"Find what's open\nwhen the city sleeps"}
          </Text>
        </View>
      </Animated.View>

      {/* Loader dot */}
      <Animated.View
        className="absolute bottom-[100px]"
        style={{ opacity: fade }}
      >
        <Image
          source={require('../assets/images/loader.png')}
          className="w-16 h-16"
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}
