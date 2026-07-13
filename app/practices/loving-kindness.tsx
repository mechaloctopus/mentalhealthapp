import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { awardResonance } from '../../src/lib/resonance';
import { GlassCard } from '../../src/components/GlassCard';
import { GradientButton } from '../../src/components/GradientButton';
import { colors, font, spacing } from '../../src/theme/tokens';

const PHRASES = [
  'May you be well.',
  'May you be happy.',
  'May you be free from suffering.',
  'May you be at peace.',
];

const CIRCLES = [
  { label: 'Yourself', instruction: 'Begin by directing loving-kindness inward. Place a hand on your heart if it helps.', color: colors.teal },
  { label: 'A loved one', instruction: 'Bring to mind someone you care about easily. See them clearly, then offer the phrases.', color: colors.lavender },
  { label: 'A neutral person', instruction: "Think of someone you see but don't know well — a neighbor, someone at work. Extend the same warmth.", color: colors.blue },
  { label: 'A difficult person', instruction: 'This is the hardest circle. Think of someone you have difficulty with. Offer the phrases — not to condone, but to release.', color: colors.amber },
  { label: 'All beings', instruction: 'Expand outward until the field of loving-kindness is boundless — every creature, in all directions.', color: colors.moss },
];

export default function LovingKindnessPractice() {
  const [circleIdx, setCircleIdx] = useState<number | null>(null);
  const [phraseIdx, setPhraseIdx] = useState(0);

  if (circleIdx !== null) {
    const circle = CIRCLES[circleIdx]!;
    const phrase = PHRASES[phraseIdx]!;
    const isLastPhrase = phraseIdx >= PHRASES.length - 1;
    const isLastCircle = circleIdx >= CIRCLES.length - 1;

    async function nextPhrase() {
      if (!isLastPhrase) {
        setPhraseIdx((i) => i + 1);
      } else if (!isLastCircle) {
        setPhraseIdx(0);
        setCircleIdx((i) => (i ?? 0) + 1);
      } else {
        await awardResonance('PRACTICE_LOVING_KINDNESS');
        setCircleIdx(null);
        setPhraseIdx(0);
      }
    }

    return (
      <SafeAreaView style={styles.root}>
        <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
        <View style={styles.session}>
          <Text style={styles.circleProgress}>{circleIdx + 1} / {CIRCLES.length}</Text>
          <Text style={[styles.circleLabel, { color: circle.color }]}>{circle.label}</Text>
          <GlassCard style={styles.instrCard}>
            <Text style={styles.instruction}>{circle.instruction}</Text>
          </GlassCard>
          <GlassCard strong style={styles.phraseCard}>
            <Text style={styles.phrase}>{phrase}</Text>
          </GlassCard>
          <GradientButton
            label={!isLastPhrase ? 'Next phrase' : !isLastCircle ? 'Next circle' : 'Finish'}
            onPress={nextPhrase}
            variant="teal"
          />
          <Pressable onPress={() => { setCircleIdx(null); setPhraseIdx(0); }}>
            <Text style={styles.endLink}>End session</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Practices</Text>
        </Pressable>
        <Text style={styles.title}>Loving-Kindness</Text>
        <Text style={styles.sub}>
          Metta meditation — extending compassion outward in expanding circles, beginning with yourself.
        </Text>

        <GlassCard style={styles.intro}>
          <Text style={styles.introText}>
            You will move through five circles. For each, silently offer four phrases. The practice
            takes 10–15 minutes at a natural pace.
          </Text>
        </GlassCard>

        <View style={styles.circles}>
          {CIRCLES.map((c, i) => (
            <GlassCard key={c.label} style={styles.circleCard}>
              <View style={[styles.dot, { backgroundColor: c.color }]} />
              <Text style={styles.circleCardLabel}>{c.label}</Text>
            </GlassCard>
          ))}
        </View>

        <GradientButton
          label="Begin"
          onPress={() => { setCircleIdx(0); setPhraseIdx(0); }}
          variant="teal"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  back: { paddingTop: spacing.lg },
  backText: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.teal },
  title: { fontFamily: font.display, fontSize: 28, color: colors.text },
  sub: { fontFamily: font.serif, fontSize: 15, color: colors.textMuted, lineHeight: 23 },
  intro: { padding: spacing.xl },
  introText: { fontFamily: font.serif, fontSize: 15, color: colors.textMuted, lineHeight: 23 },
  circles: { gap: spacing.xs },
  circleCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4 },
  circleCardLabel: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.text },
  session: { flex: 1, padding: spacing.xl, gap: spacing.xl, justifyContent: 'center' },
  circleProgress: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.textFaint, letterSpacing: 1, textAlign: 'center' },
  circleLabel: { fontFamily: font.display, fontSize: 24, textAlign: 'center' },
  instrCard: { padding: spacing.xl },
  instruction: { fontFamily: font.serif, fontSize: 15, color: colors.textMuted, lineHeight: 24 },
  phraseCard: { padding: spacing.xxl, alignItems: 'center' },
  phrase: { fontFamily: font.serif, fontSize: 22, color: colors.text, textAlign: 'center', lineHeight: 32 },
  endLink: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.textFaint, textAlign: 'center' },
});
