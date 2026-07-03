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
import { useAuth } from '../src/hooks/useAuth';
import { useState } from 'react';
import { TextInput, Alert } from 'react-native';
import { usersApi } from '../src/api/users';
import { useAuthStore } from '../src/store/authStore';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { setUser } = useAuthStore();
  
  const [firstName, setFirstName] = useState(() => {
    const parts = (user?.name ?? '').split(' ');
    return parts[0] || '';
  });
  const [lastName, setLastName] = useState(() => {
    const parts = (user?.name ?? '').split(' ');
    return parts.slice(1).join(' ') || '';
  });
  const [saving, setSaving] = useState(false);

  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
  const hasChanges = fullName !== user?.name;

  const handleSignOut = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleSave = async () => {
    if (!firstName.trim()) return Alert.alert('Error', 'First Name cannot be empty');
    setSaving(true);
    try {
      const { data } = await usersApi.updateMe({ name: fullName });
      if (user) {
        setUser({ ...user, name: data.name });
      }
      Alert.alert('Success', 'Profile updated successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner + Avatar */}
          <View style={styles.bannerContainer}>
            <Image
              source={require('../assets/images/profile-banner.png')}
              style={styles.banner}
              resizeMode="cover"
            />
            <View style={styles.avatarWrapper}>
              <Image
                source={require('../assets/images/default-avatar.png')}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Username */}
          <Text style={styles.username}>{user?.name ?? 'User'}</Text>

          {/* Read-only fields / Edit fields */}
          <View style={styles.fieldsCard}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor="rgba(44,44,44,0.3)"
              />
            </View>
            <View style={styles.fieldDivider} />
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor="rgba(44,44,44,0.3)"
              />
            </View>
            <View style={styles.fieldDivider} />
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Phone</Text>
              <Text style={styles.fieldValue}>{user?.email?.replace('@lnc.app', '') ?? '—'}</Text>
            </View>
          </View>

          {/* Save Changes */}
          <TouchableOpacity
            style={hasChanges ? styles.btnLime : styles.btnDisabled}
            disabled={!hasChanges || saving}
            activeOpacity={0.85}
            onPress={handleSave}
          >
            <Text style={hasChanges ? styles.btnLimeText : styles.btnDisabledText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>

          {/* Sign Out */}
          <TouchableOpacity
            style={styles.btnOutline}
            onPress={handleSignOut}
            activeOpacity={0.85}
          >
            <Text style={styles.btnOutlineText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C2C2C',
  },
  safe: {
    flex: 1,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#3A3A3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // ── Scroll ──
  scrollContent: {
    paddingBottom: 40,
    gap: 16,
  },

  // ── Banner / Avatar ──
  bannerContainer: {
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: 180,
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: -48,
    left: 24,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#2C2C2C',
    overflow: 'hidden',
    backgroundColor: '#2C2C2C',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },

  // ── Username ──
  username: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'left',
    marginLeft: 24,
    marginTop: 60,
  },

  // ── Fields card ──
  fieldsCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  fieldRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(44,44,44,0.5)',
  },
  fieldValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#2C2C2C',
  },
  fieldInput: {
    flex: 1,
    textAlign: 'right',
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#2C2C2C',
    padding: 0,
    height: '100%',
  },
  fieldDivider: {
    height: 1,
    backgroundColor: 'rgba(44,44,44,0.08)',
  },

  // ── Buttons ──
  btnDisabled: {
    marginHorizontal: 20,
    height: 68,
    backgroundColor: 'rgba(198,255,52,0.35)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabledText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: 'rgba(44,44,44,0.5)',
  },
  btnLime: {
    marginHorizontal: 20,
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
    marginHorizontal: 20,
    height: 68,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
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
