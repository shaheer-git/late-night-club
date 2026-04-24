import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-dark items-center justify-center gap-6 px-8">
      <Text className="text-[64px]">🌙</Text>
      <Text className="font-bold text-[24px] text-white text-center">
        This page doesn't exist
      </Text>
      <Text className="font-regular text-[15px] text-white/50 text-center">
        Even night owls get lost sometimes.
      </Text>
      <TouchableOpacity
        className="h-[52px] bg-lime rounded-lg px-8 items-center justify-center"
        onPress={() => router.replace('/(tabs)')}
      >
        <Text className="font-semibold text-[16px] text-dark">Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}
