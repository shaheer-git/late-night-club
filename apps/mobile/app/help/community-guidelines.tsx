import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const GUIDELINES = [
  {
    title: '1. Our Community',
    text: 'Late Night Club is built on trust. Every user contributes to keeping venue information accurate and helpful for everyone. Please use the app responsibly and respectfully.',
  },
  {
    title: '2. Provide Accurate Information',
    text: 'When submitting information, you should:\n• Mark venues as Open or Closed only if you reasonably believe the information is accurate.\n• Add new venues only if they actually exist.\n• Submit accurate names, addresses, and categories.\n• Update information honestly and in good faith.\n\nDo not intentionally submit false, misleading, or outdated information.',
  },
  {
    title: '3. Respect Other Users',
    text: 'Treat everyone with respect. You must not:\n• Harass or bully other users.\n• Threaten or intimidate anyone.\n• Use abusive, offensive, or hateful language.\n• Discriminate based on race, religion, nationality, gender, sexual orientation, disability, or any protected characteristic.',
  },
  {
    title: '4. No Spam',
    text: 'The following are prohibited:\n• Repeated submissions of the same venue.\n• Fake venue listings.\n• Promotional content unrelated to venue information.\n• Advertising products or services without permission.\n• Posting irrelevant or misleading information.',
  },
  {
    title: '5. No Fraudulent Activity',
    text: 'Do not:\n• Manipulate venue status.\n• Falsely mark businesses as open or closed.\n• Create fake accounts.\n• Impersonate another person or business.\n• Attempt to deceive other users.\n\nAccounts involved in fraudulent activity may be permanently suspended.',
  },
  {
    title: '6. Respect Businesses',
    text: 'Late Night Club exists to help users find businesses—not to harm them.\nDo not:\n• Defame businesses.\n• Submit malicious reports.\n• Target businesses with false updates.\n• Coordinate fake community reports.',
  },
  {
    title: '7. Protect Privacy',
    text: 'Do not post:\n• Phone numbers\n• Personal addresses\n• Email addresses\n• Government IDs\n• Financial information\n• Private conversations\n• Any personal information without consent\n\nRespect everyone\'s privacy.',
  },
  {
    title: '8. No Illegal Content',
    text: 'You may not use Late Night Club to promote or facilitate:\n• Illegal activities\n• Drugs or controlled substances\n• Violence\n• Human trafficking\n• Exploitation\n• Terrorism\n• Criminal activity',
  },
  {
    title: '9. No Harmful Content',
    text: 'Do not upload or share content that includes:\n• Pornographic material\n• Graphic violence\n• Hate speech\n• Threats\n• Harassment\n• Obscene language\n• Content intended to shock or offend',
  },
  {
    title: '10. Fair Use of the Platform',
    text: 'You may not:\n• Use bots or automated tools without permission.\n• Scrape or copy our venue database.\n• Reverse engineer the application.\n• Attempt unauthorized access to our systems.\n• Circumvent security measures.\n• Overload our servers with automated requests.',
  },
  {
    title: '11. Report Problems Responsibly',
    text: 'If you notice:\n• Incorrect venue information\n• Abuse\n• Fake accounts\n• Spam\n• Technical issues\n\nPlease report them through the app or contact our support team.',
  },
  {
    title: '12. Account Enforcement',
    text: 'If you violate these Community Guidelines, we may take actions including:\n• Removing your submissions.\n• Restricting certain features.\n• Temporarily suspending your account.\n• Permanently banning your account.\n• Reporting illegal activity to law enforcement where required.\n\nSerious or repeated violations may result in immediate account termination.',
  },
  {
    title: '13. Community Contributions',
    text: 'By submitting venue information, you acknowledge that:\n• Your contributions may be reviewed by our moderation team.\n• We may edit or remove inaccurate submissions.\n• Your contributions help improve the experience for all users.',
  },
  {
    title: '14. Help Keep Late Night Club Reliable',
    text: 'Every contribution matters.\nPlease verify information before submitting updates and use the app responsibly so that everyone can rely on accurate, up-to-date venue information.',
  },
  {
    title: '15. Changes to These Guidelines',
    text: 'We may update these Community Guidelines from time to time. Continued use of the app after changes become effective constitutes acceptance of the revised Guidelines.',
  },
  {
    title: '16. Contact Us',
    text: 'If you have questions or need to report a violation, contact us:\nEmail: developer.fyrehub@gmail.com\nAddress: Bengaluru, Karnataka, India',
  },
];

export default function CommunityGuidelinesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community Guidelines</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerIcon}>
            <Ionicons name="people-circle-outline" size={60} color="#C6FF34" />
          </View>
          <Text style={styles.title}>Our Community Rules</Text>
          <Text style={styles.subtitle}>
            Effective Date: 5 July 2026{'\n\n'}
            Welcome to Late Night Club! Our goal is to help people discover late-night venues with accurate, community-driven information. These Community Guidelines explain the standards we expect all users to follow. By using the app, you agree to comply with these guidelines.
          </Text>

          {GUIDELINES.map((rule, idx) => (
            <View key={idx} style={styles.ruleCard}>
              <Text style={styles.ruleTitle}>{rule.title}</Text>
              <Text style={styles.ruleText}>{rule.text}</Text>
            </View>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
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
  content: { paddingHorizontal: 24, paddingTop: 20 },
  headerIcon: { alignItems: 'center', marginBottom: 16 },
  title: {
    fontFamily: 'Inter_700Bold', fontSize: 24, color: '#FFFFFF',
    marginBottom: 8, textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.6)',
    lineHeight: 22, marginBottom: 32, textAlign: 'center',
  },
  ruleCard: {
    backgroundColor: '#3A3A3A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#C6FF34',
  },
  ruleTitle: {
    fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFFFFF',
    marginBottom: 8,
  },
  ruleText: {
    fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
});
