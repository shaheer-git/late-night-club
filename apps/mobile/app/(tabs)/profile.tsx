import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { usersApi } from '../../src/api/users';
import { Place } from '../../src/types';
import StatusBadge from '../../src/components/place/StatusBadge';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [contributions, setContributions] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'added' | 'verified'>('added');

  useEffect(() => {
    if (isAuthenticated) fetchContributions();
  }, [isAuthenticated]);

  const fetchContributions = async () => {
    setLoading(true);
    try {
      const { data } = await usersApi.getMyContributions();
      setContributions(data);
    } catch {}
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-[rgba(44,44,44,0.5)]">
        <StatusBar style="light" />
        <SafeAreaView className="flex-1" edges={['top']}>
          <View className="items-center gap-5 pt-12 px-[46px]">
            <View className="w-[84px] h-[84px] rounded-full bg-[#FFDCB9] items-center justify-center">
              <Text className="text-[36px]">🌊</Text>
            </View>
            <View className="items-center gap-2">
              <Text className="font-semibold text-[18px] text-white text-center">Ahoy, Wanderer!</Text>
              <Text className="font-medium text-[14px] text-white leading-6 text-center">
                Log in to add or verify places and help keep Late Night accurate.
              </Text>
            </View>
          </View>
          <View className="px-6 mt-5 gap-3">
            <TouchableOpacity
              className="h-[68px] bg-lime rounded-lg items-center justify-center"
              onPress={() => router.push('/(auth)/login')}
            >
              <Text className="font-semibold text-[18px] text-dark">Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="h-[68px] border border-white rounded-lg items-center justify-center"
              onPress={() => router.push('/(auth)/register')}
            >
              <Text className="font-semibold text-[18px] text-white">Create Account</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[rgba(44,44,44,0.5)]">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 140, gap: 16 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchContributions} tintColor="#fff" />}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile card */}
          <View className="bg-dark rounded-xl overflow-hidden pb-3 items-center">
            {/* Banner */}
            <View className="w-full h-[174px] bg-[#333]">
              <Image
                source={require('../../assets/images/map-bg.png')}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            {/* Avatar */}
            <View className="-mt-[42px] border-[3px] border-dark rounded-full">
              <View className="w-[84px] h-[84px] rounded-full bg-[#FFDBDE] items-center justify-center overflow-hidden">
                {user?.avatar_url
                  ? <Image source={{ uri: user.avatar_url }} className="w-full h-full" resizeMode="cover" />
                  : <Text className="text-[36px]">👤</Text>
                }
              </View>
            </View>
            <Text className="font-semibold text-[18px] text-white mt-2">{user?.name}</Text>
            {/* Stats */}
            <View className="flex-row w-[322px] justify-between mt-4">
              {[
                { val: user?.contribution_count ?? 0, label: 'Pinned Spots' },
                { val: user?.verification_count ?? 0, label: 'Verified Places' },
                { val: 2000, label: 'Trust Score' },
              ].map(s => (
                <View key={s.label} className="flex-1 items-center">
                  <Text className="font-semibold text-[18px] text-white text-center">{s.val}</Text>
                  <Text className="font-regular text-[12px] text-white leading-6 text-center">{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Menu group 1 */}
          <View className="bg-dark rounded-xl p-[10px] gap-2">
            {[
              { icon: '👤', label: 'Profile Settings', onPress: () => router.push('/settings') },
              { icon: '🏅', label: 'My Contributions', onPress: () => {} },
            ].map((item, idx, arr) => (
              <View key={item.label}>
                <TouchableOpacity
                  className="flex-row items-center justify-between px-2 py-1 h-[52px]"
                  onPress={item.onPress}
                >
                  <View className="flex-row items-center gap-1">
                    <Text className="text-[18px] w-[18px]">{item.icon}</Text>
                    <Text className="font-regular text-[16px] text-white px-[10px]">{item.label}</Text>
                  </View>
                  <Text className="text-white text-xl">›</Text>
                </TouchableOpacity>
                {idx < arr.length - 1 && <View className="h-px bg-white/50 mx-1" />}
              </View>
            ))}
          </View>

          {/* Menu group 2 */}
          <View className="bg-dark rounded-xl p-[10px] gap-2">
            {[
              { icon: '⚙️', label: 'General Settings', onPress: () => router.push('/settings') },
              { icon: '❓', label: 'Help & Support', onPress: () => {} },
            ].map((item, idx, arr) => (
              <View key={item.label}>
                <TouchableOpacity
                  className="flex-row items-center justify-between px-2 py-1 h-[52px]"
                  onPress={item.onPress}
                >
                  <View className="flex-row items-center gap-1">
                    <Text className="text-[18px] w-[18px]">{item.icon}</Text>
                    <Text className="font-regular text-[16px] text-white px-[10px]">{item.label}</Text>
                  </View>
                  <Text className="text-white text-xl">›</Text>
                </TouchableOpacity>
                {idx < arr.length - 1 && <View className="h-px bg-white/50 mx-1" />}
              </View>
            ))}
          </View>

          {/* Contributions */}
          {contributions.length > 0 && (
            <View className="gap-3">
              <View className="flex-row gap-3">
                {(['added', 'verified'] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    className={`flex-1 h-10 rounded-lg items-center justify-center ${
                      activeTab === t ? 'bg-lime' : 'bg-white/10'
                    }`}
                    onPress={() => setActiveTab(t)}
                  >
                    <Text className={`font-semibold text-[13px] ${activeTab === t ? 'text-dark' : 'text-white'}`}>
                      {t === 'added' ? 'Added Places' : 'Verified Places'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {contributions.map(place => (
                <TouchableOpacity
                  key={place.id}
                  className="bg-white rounded-xl border border-dark p-3 flex-row gap-3 items-center"
                  onPress={() => router.push(`/place/${place.id}`)}
                >
                  <View className="w-[70px] h-[70px] rounded-lg bg-gray-200 overflow-hidden">
                    {place.image_urls?.[0]
                      ? <Image source={{ uri: place.image_urls[0] }} className="w-full h-full" resizeMode="cover" />
                      : <View className="flex-1 items-center justify-center"><Text className="text-2xl">🏪</Text></View>
                    }
                  </View>
                  <View className="flex-1 gap-1">
                    <Text className="font-semibold text-[16px] text-dark" numberOfLines={1}>{place.name}</Text>
                    <StatusBadge status={place.status} size="sm" />
                  </View>
                  <Text className="text-dark text-xl">›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Logout */}
          <TouchableOpacity
            className="h-[68px] bg-lime rounded-lg items-center justify-center"
            onPress={logout}
          >
            <Text className="font-semibold text-[18px] text-dark">Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
