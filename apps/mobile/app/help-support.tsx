import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useState } from 'react';
import CustomDialog from '../src/components/common/CustomDialog';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type HelpRow = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
};

const ROWS: HelpRow[] = [
  { icon: 'flag-outline',         label: 'Report an issue' },
  { icon: 'people-outline',       label: 'Community guidelines' },
  { icon: 'help-circle-outline',  label: 'FAQ' },
  { icon: 'mail-outline',         label: 'Contact support' },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Card */}
        <View style={styles.card}>
          {ROWS.map((item, idx) => (
            <View key={item.label}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => setShowComingSoon(true)}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.iconBox}>
                    <Ionicons name={item.icon} size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
              {idx < ROWS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </SafeAreaView>

      <CustomDialog
        visible={showComingSoon}
        title="Coming Soon"
        message="This feature is not available yet. We are working hard to bring it to you soon!"
        confirmText="Got it"
        onConfirm={() => setShowComingSoon(false)}
        onCancel={() => setShowComingSoon(false)}
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

  // ── Card ──
  card: {
    marginHorizontal: 16,
    marginTop: 8,
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
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 4,
  },
});
