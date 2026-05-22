import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Screen 1 — Welcome
// Radial network icon, "Welcome to Late Night Club." bold, italic subtitle, lime CTA

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Icon — upper portion */}
        <View style={styles.iconWrap}>
          <Image
            source={require('../../assets/images/auth/Welcome-Screen-Icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>

        {/* Text + CTA */}
        <View style={styles.content}>
          <View style={styles.textBlock}>
            <Text style={styles.welcomeTo}>Welcome to</Text>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Late Night{'\n'}Club.</Text>
              <Text style={styles.subtitle}>
                Find what's open when{'\n'}the city sleeps
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Let's start roaming</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#2C2C2C' },
  safe: { flex: 1 },

  iconWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  icon: {
    width: 160,
    height: 160,
  },

  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 40,
  },

  textBlock: { gap: 6 },

  welcomeTo: {
    fontFamily: 'Inter_500Medium',
    fontSize: 22,
    color: '#FFFFFF',
    lineHeight: 28,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 10,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 48,
    color: '#FFFFFF',
    lineHeight: 52,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 8,
    flexShrink: 1,
  },

  btn: {
    height: 68,
    backgroundColor: '#C6FF34',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#2C2C2C',
  },
});
