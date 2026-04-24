import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-dark">
      <StatusBar style="light" />
      <View className="absolute top-[128px] left-[115px] w-[160px] h-[162px] rounded-full bg-purple/6" />

      <SafeAreaView className="flex-1 items-center" edges={['top', 'bottom']}>
        <View className="absolute top-[41.6%] left-6 right-6 gap-16 items-center">

          {/* Text + logo group */}
          <View className="w-[309px] gap-3">
            <Text className="font-medium text-[32px] text-white leading-10">
              Welcome to
            </Text>
            <View className="w-[309px] h-[103px] relative">
              <Image
                source={require('../../assets/images/welcome-logo.png')}
                className="w-[278px] h-[102px]"
                resizeMode="contain"
              />
              <View className="absolute right-0 bottom-0 w-[159px] h-10">
                <Text className="font-medium text-[15px] text-white leading-5 italic tracking-tight">
                  Find what's open when the city sleeps
                </Text>
              </View>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            className="w-[342px] h-[68px] bg-lime rounded-lg items-center justify-center"
            onPress={() => router.replace('/(tabs)')}
          >
            <Text className="font-semibold text-[16px] text-dark">
              Let's start roaming
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
