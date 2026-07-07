import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { useLocationStore } from '../../src/store/locationStore';

const ONBOARDING_KEY = 'lnc_onboarding_done_v2';

export default function LocationPermissionScreen() {
  const router = useRouter();
  const { setLocation, setPermission } = useLocationStore();
  const [allSet, setAllSet] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermission(status === 'granted');
    if (status === 'granted') {
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(loc.coords.latitude, loc.coords.longitude);
      } catch (err) {
        console.warn("Location fetch failed:", err);
      }
    }
    // If denied, location store keeps city coords set during city-select — fallback to map
    setAllSet(true);
    await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
    setTimeout(() => router.replace('/(tabs)'), 1800);
  };

  // ── All set! ─────────────────────────────────────────────────────────────────
  if (allSet) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.content}>
            <Image
              source={require('../../assets/images/digital-nomad.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
            <View style={styles.textBlock}>
              <Text style={styles.titleTitan}>All set!</Text>
              <Text style={styles.subtitle}>
                Showing places near you that are{'\n'}open right now.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Hola! ─────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Back button — uses router.back() which navigates to city-select */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/onboarding/city-select')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Animated.View style={[styles.content, { opacity: fade }]}>
          <Image
            source={require('../../assets/images/hot-air-balloon.png')}
            style={styles.illustration}
            resizeMode="contain"
          />

          <View style={styles.textBlock}>
            <Text style={styles.titleTitan}>Hola!</Text>
            <Text style={styles.subtitle}>
              This helps us show nearby places{'\n'}that are currently open.
            </Text>
          </View>

          <View style={styles.btnWrapper}>
            <TouchableOpacity style={styles.btn} onPress={requestLocation} activeOpacity={0.85}>
              <Text style={styles.btnText}>Set Current Location</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C2C2C' },
  safe: { flex: 1 },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 16,
    zIndex: 10,
    padding: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: 48,
  },
  illustration: {
    width: 258,
    height: 258,
  },
  textBlock: {
    alignItems: 'center',
    gap: 8,
    width: 220,
  },
  titleTitan: {
    fontFamily: 'TitanOne_400Regular',
    fontSize: 34,
    lineHeight: 40,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  btnWrapper: {
    width: 294,
  },
  btn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  btnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    color: '#2C2C2C',
  },
});
