import { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useLocationStore } from '../../src/store/locationStore';

export default function LocationPermissionScreen() {
  const router = useRouter();
  const { setLocation, setPermission } = useLocationStore();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermission(status === 'granted');
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(loc.coords.latitude, loc.coords.longitude);
    }
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-dark">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1 items-center" edges={['top', 'bottom']}>

        {/* Illustration */}
        <Animated.View className="mt-[10%] w-[258px] h-[258px]" style={{ opacity: fade }}>
          <Image
            source={require('../../assets/images/hot-air-balloon.png')}
            className="w-full h-full"
            resizeMode="contain"
          />
        </Animated.View>

        {/* Text */}
        <Animated.View className="w-[220px] items-center gap-2 mt-[18px]" style={{ opacity: fade }}>
          <View className="px-[10px] py-[10px]">
            <Text className="font-bold text-[34px] text-white text-center" style={{ lineHeight: 40 }}>
              Hola!
            </Text>
          </View>
          <Text className="font-medium text-[14px] text-white text-center leading-5">
            This helps us show nearby places that are currently open.
          </Text>
        </Animated.View>

        {/* Set Location button */}
        <View className="w-[294px] mt-7">
          <TouchableOpacity
            className="bg-white rounded-lg h-12 items-center justify-center"
            onPress={requestLocation}
          >
            <Text className="font-medium text-[20px] text-dark">
              Set Current Location
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skip */}
        <TouchableOpacity
          className="absolute bottom-5 px-[10px] py-[10px]"
          onPress={() => router.replace('/(tabs)')}
        >
          <Text className="font-regular text-[14px] text-white/50">Skip</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </View>
  );
}
