import { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Switch, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { usersApi } from '../src/api/users';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'general'>('profile');

  const saveProfile = async () => {
    setSaving(true);
    try {
      await usersApi.updateMe({ name });
    } catch {}
    setSaving(false);
  };

  return (
    <View className="flex-1 bg-dark">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top']}>

        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 py-3">
          <TouchableOpacity
            className="w-10 h-10 bg-white/10 rounded-lg items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-white text-lg">←</Text>
          </TouchableOpacity>
          <Text className="font-semibold text-[17px] text-white flex-1 text-center">Settings</Text>
        </View>

        {/* Section tabs */}
        <View className="flex-row gap-3 px-4 mb-4">
          {(['profile', 'general'] as const).map(s => (
            <TouchableOpacity
              key={s}
              className={`flex-1 h-10 rounded-[18px] items-center justify-center ${
                activeSection === s ? 'bg-lime' : 'bg-white/10'
              }`}
              onPress={() => setActiveSection(s)}
            >
              <Text className={`font-semibold text-[13px] capitalize ${
                activeSection === s ? 'text-dark' : 'text-white'
              }`}>
                {s === 'profile' ? 'Profile Settings' : 'General Settings'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, gap: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {activeSection === 'profile' && (
            <>
              {/* Avatar */}
              <View className="bg-[#3A3A3A] rounded-xl p-4 items-center gap-3">
                <View className="w-[84px] h-[84px] rounded-full bg-[#FFDBDE] items-center justify-center relative">
                  <Text className="text-[36px]">👤</Text>
                  <View className="absolute bottom-0 right-0 w-[22px] h-[22px] bg-lime rounded-full items-center justify-center">
                    <Text className="text-[10px]">✏️</Text>
                  </View>
                </View>
              </View>

              {/* Full Name */}
              <View className="bg-[#3A3A3A] rounded-xl p-4 gap-3">
                <Text className="font-medium text-[15px] text-white">Full Name</Text>
                <View className="bg-white rounded-md px-4 h-14 justify-center">
                  <TextInput
                    className="font-regular text-[15px] text-dark p-0"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="rgba(44,44,44,0.4)"
                  />
                </View>
              </View>

              {/* Change City */}
              <TouchableOpacity
                className="bg-[#3A3A3A] rounded-[18px] h-[68px] items-center justify-center"
                onPress={() => router.push('/onboarding/city-select')}
              >
                <Text className="font-regular text-[18px] text-white">Change City</Text>
              </TouchableOpacity>

              {/* Save */}
              <TouchableOpacity
                className={`h-[68px] bg-lime rounded-[18px] items-center justify-center ${saving ? 'opacity-50' : ''}`}
                onPress={saveProfile}
                disabled={saving}
              >
                <Text className="font-semibold text-[18px] text-dark">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {activeSection === 'general' && (
            <>
              {/* Region & Location */}
              <Text className="font-semibold text-[13px] text-white/50 px-1 pt-2 uppercase tracking-wider">
                Region & Location
              </Text>
              <View className="bg-[#3A3A3A] rounded-xl p-[10px] gap-2">
                {[
                  { icon: '⚙️', label: 'City', sub: 'Bangalore, IN' },
                  { icon: '📍', label: 'Location access', sub: 'While Using App' },
                ].map((item, idx, arr) => (
                  <View key={item.label}>
                    <TouchableOpacity className="flex-row items-center justify-between px-2 h-[52px]">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-[18px]">{item.icon}</Text>
                        <View className="px-[10px] gap-1">
                          <Text className="font-regular text-[14px] text-white">{item.label}</Text>
                          <Text className="font-regular text-[10px] text-white/50">{item.sub}</Text>
                        </View>
                      </View>
                      <Text className="text-white text-xl">›</Text>
                    </TouchableOpacity>
                    {idx < arr.length - 1 && <View className="h-px bg-white/50 mx-1" />}
                  </View>
                ))}
              </View>

              {/* Preferences */}
              <Text className="font-semibold text-[13px] text-white/50 px-1 uppercase tracking-wider">Preferences</Text>
              <View className="bg-[#3A3A3A] rounded-xl p-[10px] gap-2">
                <View className="flex-row items-center justify-between px-2 h-[52px]">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[18px]">🔔</Text>
                    <Text className="font-regular text-[14px] text-white px-[10px]">Notifications</Text>
                  </View>
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{ false: '#555', true: '#C6FF34' }}
                    thumbColor="#fff"
                  />
                </View>
                <View className="h-px bg-white/50 mx-1" />
                <TouchableOpacity className="flex-row items-center justify-between px-2 h-[52px]">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[18px]">🦇</Text>
                    <View className="px-[10px] gap-1">
                      <Text className="font-regular text-[14px] text-white">Appearance</Text>
                      <Text className="font-regular text-[10px] text-white/50">I'm Batman</Text>
                    </View>
                  </View>
                  <Text className="text-white text-xl">›</Text>
                </TouchableOpacity>
              </View>

              {/* Data & Privacy */}
              <Text className="font-semibold text-[13px] text-white/50 px-1 uppercase tracking-wider">Data & Privacy</Text>
              <View className="bg-[#3A3A3A] rounded-xl p-[10px] gap-2">
                {[
                  { icon: '🗑️', label: 'Clear cache' },
                  { icon: '🛡️', label: 'Privacy policy' },
                  { icon: '📄', label: 'Terms of use' },
                  { icon: '❓', label: 'Help & Support' },
                ].map((item, idx, arr) => (
                  <View key={item.label}>
                    <TouchableOpacity className="flex-row items-center justify-between px-2 h-[52px]">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-[18px]">{item.icon}</Text>
                        <Text className="font-regular text-[14px] text-white px-[10px]">{item.label}</Text>
                      </View>
                      <Text className="text-white text-xl">›</Text>
                    </TouchableOpacity>
                    {idx < arr.length - 1 && <View className="h-px bg-white/50 mx-1" />}
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
