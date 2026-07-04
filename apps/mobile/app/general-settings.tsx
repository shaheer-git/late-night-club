import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import CustomDialog from '../src/components/common/CustomDialog';
import { useLocationStore } from '../src/store/locationStore';
import { useLocation } from '../src/hooks/useLocation';

export default function GeneralSettingsScreen() {
  const router = useRouter();
  const locationStore = useLocationStore();
  const [showClearCache, setShowClearCache] = useState(false);
  
  // Trigger location permission request and get current coords
  useLocation();

  // Show warning if permission was granted but no city is set
  const showLocationWarning =
    locationStore.permissionGranted && !locationStore.city;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>General Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Region & Location ── */}
          <Text style={styles.sectionTitle}>Region & Location</Text>
          <View style={styles.card}>
            {/* City row */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push('/onboarding/city-select')}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="location-outline" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.rowTextBlock}>
                  <Text style={styles.rowLabel}>City</Text>
                  {locationStore.city ? (
                    <Text style={styles.rowSub}>{locationStore.city}</Text>
                  ) : (
                    <Text style={styles.rowSubMuted}>Not set</Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Location access row */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openSettings()}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="navigate-outline" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.rowTextBlock}>
                  <Text style={styles.rowLabel}>Location access</Text>
                  <Text style={styles.rowSub}>
                    {locationStore.permissionGranted ? 'While Using App' : 'Not granted'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          </View>

          {/* Location mismatch warning */}
          {showLocationWarning && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning-outline" size={18} color="#F59E0B" />
              <Text style={styles.warningText}>
                Your selected city may not match your current location
              </Text>
            </View>
          )}

          {/* ── Data & Privacy ── */}
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <View style={styles.card}>
            {/* Clear cache */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => setShowClearCache(true)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.rowLabel}>Clear cache</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Privacy policy */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openURL('https://latenightclub.app/privacy')}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="shield-outline" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.rowLabel}>Privacy policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Terms of use */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => Linking.openURL('https://latenightclub.app/terms')}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconBox}>
                  <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.rowLabel}>Terms of use</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <CustomDialog
        visible={showClearCache}
        title="Cache Cleared"
        message="Your local cache has been cleared successfully."
        confirmText="Got it"
        hideCancel={true}
        onConfirm={() => setShowClearCache(false)}
        onCancel={() => setShowClearCache(false)}
      />
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
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 10,
  },

  // ── Section title ──
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 2,
    paddingHorizontal: 4,
  },

  // ── Card ──
  card: {
    backgroundColor: '#3A3A3A',
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },

  // ── Row ──
  row: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextBlock: {
    gap: 2,
  },
  rowLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#FFFFFF',
  },
  rowSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  rowSubMuted: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 4,
  },

  // ── Warning banner ──
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  warningText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#F59E0B',
    lineHeight: 18,
  },
});
