import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';

export default function ProfileScreen() {
  const router = useRouter();
  const { user: realUser, isAuthenticated: realAuth, logout } = useAuth();

  // ── DEV MOCK — remove when backend auth is working ────────────────────────
  const DEV_MOCK = true; // set to false to use real auth
  const isAuthenticated = DEV_MOCK ? true : realAuth;
  const user = DEV_MOCK ? {
    id: 'dev-1',
    name: 'Heisenberg',
    email: 'dev@lnc.app',
    contribution_count: 23,
    verification_count: 7,
    created_at: new Date().toISOString(),
  } : realUser;
  // ─────────────────────────────────────────────────────────────────────────

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.guestCenter}>
            <View style={styles.guestAvatar}>
              <Text style={styles.guestEmoji}>🌊</Text>
            </View>
            <View style={styles.guestTextBlock}>
              <Text style={styles.guestTitle}>Ahoy, Wanderer!</Text>
              <Text style={styles.guestSubtitle}>
                Log in to add or verify places and help keep Late Night Club accurate.
              </Text>
            </View>
          </View>
          <View style={styles.guestButtons}>
            <TouchableOpacity
              style={styles.btnLime}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnLimeText}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnOutlineText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile card */}
          <View style={styles.profileCard}>
            {/* Banner */}
            <Image
              source={require('../../assets/images/profile-banner.png')}
              style={styles.banner}
              resizeMode="cover"
            />
            
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <Image
                source={require('../../assets/images/default-avatar.png')}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>

            {/* Username */}
            <Text style={styles.username}>{user?.name ?? 'User'}</Text>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {String(user?.contribution_count ?? 0).padStart(2, '0')}
                </Text>
                <Text style={styles.statLabel}>Pinned Spots</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {String(user?.verification_count ?? 0).padStart(2, '0')}
                </Text>
                <Text style={styles.statLabel}>Verified Places</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2000</Text>
                <Text style={styles.statLabel}>Trust Score</Text>
              </View>
            </View>
          </View>

          {/* Menu section 1 */}
          <View style={styles.menuCard}>
            <MenuRow
              icon="person-outline"
              label="Profile Settings"
              onPress={() => router.push('/profile-settings')}
            />
            <View style={styles.divider} />
            <MenuRow
              icon="bookmark-outline"
              label="My Contributions"
              onPress={() => router.push('/my-contributions')}
            />
          </View>

          {/* Menu section 2 */}
          <View style={styles.menuCard}>
            <MenuRow
              icon="settings-outline"
              label="General Settings"
              onPress={() => router.push('/general-settings')}
            />
            <View style={styles.divider} />
            <MenuRow
              icon="help-circle-outline"
              label="Help & Support"
              onPress={() => router.push('/help-support')}
            />
          </View>

          {/* Log Out */}
          <TouchableOpacity
            style={styles.btnLime}
            onPress={logout}
            activeOpacity={0.85}
          >
            <Text style={styles.btnLimeText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Menu row component ────────────────────────────────────────────────────────
function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuRowLeft}>
        <View style={styles.menuIconBox}>
          <Ionicons name={icon} size={18} color="#FFFFFF" />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C2C2C',
  },
  safe: {
    flex: 1,
  },

  // ── Guest state ──
  guestCenter: {
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 46,
    gap: 20,
  },
  guestAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFDCB9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestEmoji: {
    fontSize: 36,
  },
  guestTextBlock: {
    alignItems: 'center',
    gap: 8,
  },
  guestTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  guestSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
  guestButtons: {
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 12,
  },

  // ── Logged-in scroll ──
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 140,
    gap: 16,
  },

  // ── Profile card ──
  profileCard: {
    backgroundColor: '#3A3A3A',
    borderRadius: 24,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: 180,
  },
  avatarContainer: {
    alignSelf: 'flex-start',
    marginLeft: 24,
    marginTop: -48,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#3A3A3A',
    overflow: 'hidden',
    backgroundColor: '#3A3A3A',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  username: {
    alignSelf: 'flex-start',
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginLeft: 24,
    marginTop: 12,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    color: '#FFFFFF',
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },

  // ── Menu card ──
  menuCard: {
    backgroundColor: '#3A3A3A',
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  menuRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 4,
  },

  // ── Shared buttons ──
  btnLime: {
    height: 68,
    backgroundColor: '#C6FF34',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLimeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#2C2C2C',
  },
  btnOutline: {
    height: 68,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});
