import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Figma NAV Bar specs:
// bg: #2C2C2C, borderRadius: 38px 38px 0px 0px
// padding: 10px 10px 7px, gap: 15px, width: 390, height: 112
// Active pill: row, gap 12, padding 4px 6px, height 64, borderRadius 100, bg rgba(255,255,255,0.08)
//   - icon container: row, center, gap 10, padding 10 → white circle bg
//   - label: Inter SemiBold 14px, #FAFAFF
// Inactive: 64×64, same bg, borderRadius 100

const TABS = [
  { name: 'index',   label: 'Home',    icon: 'home',           iconActive: 'home' },
  { name: 'map',     label: 'Search',  icon: 'search-outline', iconActive: 'search' },
  { name: 'add',     label: 'Add',     icon: 'add-outline',    iconActive: 'add' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
] as const;

function TabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 7) }]}>
      <View style={styles.row}>
        {state.routes.map((route: any, idx: number) => {
          const tab = TABS[idx];
          const isFocused = state.index === idx;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.8}
              style={[styles.pill, isFocused && styles.pillActive]}
            >
              {isFocused ? (
                <>
                  {/* White circle icon container */}
                  <View style={styles.iconCircle}>
                    <Ionicons name={tab.iconActive as any} size={25} color="#2C2C2C" />
                  </View>
                  <Text style={styles.label}>{tab.label}</Text>
                </>
              ) : (
                <Ionicons name={tab.icon as any} size={20} color="rgba(255,255,255,0.6)" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Home indicator — 172×4, rgba(255,255,255,0.3) */}
      <View style={styles.indicator} />
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

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2C2C2C',
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    paddingHorizontal: 10,
    paddingTop: 10,
    gap: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Inactive: 64×64, borderRadius 100, rgba(255,255,255,0.08)
  pill: {
    width: 64,
    height: 64,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Active: row, gap 12, padding 4px 6px, height 64, hug width
  pillActive: {
    width: 'auto',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  // White circle: row center, gap 10, padding 10, borderRadius 100
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Label: Inter SemiBold 14px, #FAFAFF
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FAFAFF',
  },
  // Home indicator: 172×4, rgba(255,255,255,0.3), centered
  indicator: {
    width: 172,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
  },
});
