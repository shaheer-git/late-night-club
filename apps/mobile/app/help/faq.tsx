import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  {
    question: 'How do I add a new place to the map?',
    answer: 'Tap the "+" button in the middle of the bottom navigation bar. You can search for the place by name, adjust its pin on the map, and fill in the details. Once submitted, it will be added to the public map for everyone to see!',
  },
  {
    question: 'How do I earn community points?',
    answer: 'You earn community points by contributing to the app. Adding a new verified place or submitting a helpful review grants you points that build your Trust Score over time.',
  },
  {
    question: 'Why was my submitted place rejected?',
    answer: 'Places may be removed if they are duplicates, contain inaccurate information, or violate our community guidelines (such as inappropriate names or photos). Make sure your details are accurate before submitting.',
  },
  {
    question: 'How do I change my city?',
    answer: 'Go to your Profile tab, tap "Settings" (the gear icon), and select "General Settings". From there, tap on "City" under Region & Location to pick a new default city.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.faqCard}>
      <TouchableOpacity style={styles.faqHeader} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="rgba(255,255,255,0.5)"
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.faqBody}>
          <Text style={styles.faqAnswer}>{answer}</Text>
        </View>
      )}
    </View>
  );
}

export default function FAQScreen() {
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
          <Text style={styles.headerTitle}>FAQ</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Frequently Asked Questions</Text>
          <Text style={styles.subtitle}>
            Find answers to common questions about using Late Night Club.
          </Text>

          {FAQS.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
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
  content: { paddingHorizontal: 20, paddingTop: 24 },
  title: {
    fontFamily: 'Inter_700Bold', fontSize: 24, color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.6)',
    lineHeight: 22, marginBottom: 24,
  },
  faqCard: {
    backgroundColor: '#3A3A3A',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
    paddingRight: 16,
  },
  faqBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
});
