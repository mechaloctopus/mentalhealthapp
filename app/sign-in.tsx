import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signIn } from '../src/lib/auth';
import { isOnboarded } from '../src/lib/auth';
import { useStore } from '../src/store';
import { BrandMark } from '../src/components/BrandMark';
import { GradientButton } from '../src/components/GradientButton';
import { colors, font, spacing, gradients } from '../src/theme/tokens';

export default function SignIn() {
  const setUser = useStore((s) => s.setUser);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setLoading(true);
    try {
      const user = await signIn();
      setUser(user);
      const onboarded = await isOnboarded();
      setOnboarded(onboarded);
      router.replace(onboarded ? '/dashboard' : '/onboarding');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient
        colors={['#0b0e0d', '#090b0b', '#070808']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.hero}>
          <BrandMark size="lg" />
          <Text style={styles.tagline}>
            A daily signal for your inner life.
          </Text>
        </View>

        <View style={styles.cards}>
          <FeatureRow emoji="🎙️" text="Voice check-ins that read your mood in seconds" />
          <FeatureRow emoji="🌿" text="Practices matched to how you actually feel" />
          <FeatureRow emoji="📖" text="Schools of thought for lasting wellbeing" />
          <FeatureRow emoji="✦" text="A daily word — yours every morning" />
        </View>

        <View style={styles.actions}>
          <GradientButton
            label={loading ? 'Starting…' : 'Get Started'}
            onPress={handleContinue}
            disabled={loading}
          />
          <Text style={styles.legal}>
            No account required. Your data stays on your device.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
    paddingTop: spacing.xxl * 1.5,
    paddingBottom: spacing.xxl,
  },
  hero: { alignItems: 'center', gap: spacing.lg },
  tagline: {
    fontFamily: font.serif,
    fontSize: 18,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 28,
  },
  cards: {
    gap: spacing.md,
    backgroundColor: colors.panel,
    borderRadius: 24,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.panelBorder,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emoji: { fontSize: 22, width: 32 },
  featureText: {
    fontFamily: font.sans,
    fontSize: 14,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 21,
  },
  actions: { gap: spacing.md, alignItems: 'center' },
  legal: {
    fontFamily: font.sans,
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'center',
  },
});
