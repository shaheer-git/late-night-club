import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ContactSupportScreen() {
  const router = useRouter();
  const supportEmail = 'developer.fyrehub@gmail.com';

  const handleEmail = () => {
    Linking.openURL(`mailto:${supportEmail}`);
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
          <Text style={styles.headerTitle}>Contact Support</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-unread-outline" size={48} color="#C6FF34" />
          </View>
          
          <Text style={styles.title}>We're here to help</Text>
          <Text style={styles.subtitle}>
            Have a question, feedback, or need assistance? Reach out to our team and we'll get back to you as soon as possible.
          </Text>

          <View style={styles.emailCard}>
            <Ionicons name="mail-outline" size={24} color="rgba(255,255,255,0.7)" />
            <Text style={styles.emailText}>{supportEmail}</Text>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleEmail} activeOpacity={0.8}>
            <Text style={styles.btnText}>Send an Email</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C2C2C' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#3A3A3A',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 17,
    color: '#FFFFFF', textAlign: 'center',
  },
  headerSpacer: { width: 40 },
  content: {
    flex: 1, paddingHorizontal: 24, paddingTop: 40,
    alignItems: 'center',
  },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(198,255,52,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter_700Bold', fontSize: 24, color: '#FFFFFF',
    marginBottom: 12, textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.6)',
    textAlign: 'center', lineHeight: 22, marginBottom: 40,
  },
  emailCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#3A3A3A', paddingHorizontal: 20, paddingVertical: 16,
    borderRadius: 16, width: '100%', marginBottom: 24,
  },
  emailText: {
    fontFamily: 'Inter_500Medium', fontSize: 16, color: '#FFFFFF',
  },
  btn: {
    height: 60, width: '100%', backgroundColor: '#C6FF34', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontFamily: 'Inter_600SemiBold', fontSize: 17, color: '#2C2C2C' },
});
