import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  const TABS = [
    { name: 'index',   label: 'Home',    icon: '🏠' },
    { name: 'map',     label: 'Search',  icon: '🔍' },
    { name: 'add',     label: 'Add',     icon: '➕' },
    { name: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-dark rounded-t-[38px] px-[10px] pt-[10px]"
      style={{ paddingBottom: Math.max(insets.bottom, 7) }}
    >
      <View className="flex-row justify-between items-center">
        {state.routes.map((route: any, idx: number) => {
          const tab = TABS[idx];
          const isFocused = state.index === idx;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              className={`rounded-full items-center justify-center bg-white/10 ${
                isFocused ? 'flex-row gap-3 px-[6px] h-16' : 'w-16 h-16'
              }`}
            >
              {isFocused ? (
                <>
                  <View className="w-7 h-7 rounded-full bg-white items-center justify-center">
                    <Text className="text-sm">{tab.icon}</Text>
                  </View>
                  <Text className="font-semibold text-[14px] text-[#FAFAFF]">
                    {tab.label}
                  </Text>
                </>
              ) : (
                <Text className="text-sm opacity-60">{tab.icon}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Home indicator */}
      <View className="w-[172px] h-1 bg-white/30 rounded-full self-center mt-[15px]" />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="add" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
