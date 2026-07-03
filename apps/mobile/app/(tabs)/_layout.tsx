import { Tabs, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import Animated, { LinearTransition, FadeIn, FadeOut, ZoomIn, ZoomOut, FadeInRight, FadeOutRight } from 'react-native-reanimated';
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
  { name: 'index',   label: 'Home',    icon: 'home',     iconActive: 'home' },
  { name: 'map',     label: 'Search',  icon: 'search',   iconActive: 'search' },
  { name: 'add',     label: 'Add',     icon: 'add',      iconActive: 'add' },
  { name: 'profile', label: 'Profile', icon: 'person',   iconActive: 'person' },
] as const;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function TabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 7) }]}>
      <View style={styles.row}>
        {state.routes.map((route: any, idx: number) => {
          const tab = TABS[idx];
          const isFocused = state.index === idx;

          const handlePress = () => {
            if (route.name === 'add') {
              router.push('/add-place');
              return;
            }
            navigation.navigate(route.name);
          };

          return (
            <AnimatedPressable
              key={route.key}
              onPress={handlePress}
              layout={LinearTransition.springify().damping(14).stiffness(130).mass(0.8)}
              style={[styles.pill, isFocused && styles.pillActive]}
            >
              {isFocused ? (
                <Animated.View 
                  key="active"
                  entering={ZoomIn.duration(200)} 
                  exiting={FadeOut.duration(100)} 
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name={tab.iconActive as any} size={25} color="#2C2C2C" />
                  </View>
                  <Animated.Text entering={FadeInRight.delay(50).duration(200)} style={styles.label}>
                    {tab.label}
                  </Animated.Text>
                </Animated.View>
              ) : (
                <Animated.View key="inactive" entering={ZoomIn.duration(200)} exiting={FadeOut.duration(100)}>
                  <Ionicons name={tab.icon as any} size={28} color="rgba(255,255,255,0.6) fontWeight: 600" />
                </Animated.View>
              )}
            </AnimatedPressable>
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
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#1E1E1E' } }}
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
    paddingTop: 15,
    gap: 25,
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
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
  },
});
