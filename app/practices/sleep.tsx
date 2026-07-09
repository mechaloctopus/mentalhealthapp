import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { awardResonance } from '../../src/lib/resonance';
import { GlassCard } from '../../src/components/GlassCard';
import { GradientButton } from '../../src/components/GradientButton';
import { colors, font, spacing } from '../../src/theme/tokens';

const WIND_DOWNS = [
  {
    id: 'body-release',
    title: 'Body release',
    tagline: '~5 min · Progressive muscle relaxation',
    steps: [
      { label: 'Begin', body: 'Lie down somewhere comfortable. Loosen anything tight. Close your eyes.', duration: 20 },
      { label: 'Feet', body: 'Curl your toes tightly. Hold for 5 seconds. Release. Feel the difference.', duration: 15 },
      { label: 'Legs', body: 'Tighten your calves and thighs. Hold. Release. Let gravity take them.', duration: 15 },
      { label: 'Core', body: 'Clench your belly and lower back. Hold. Release. Let the floor support you.', duration: 15 },
      { label: 'Shoulders', body: 'Pull your shoulders up toward your ears. Hold. Drop them completely.', duration: 15 },
      { label: 'Face', body: 'Scrunch your face — eyes, jaw, forehead. Hold. Let it go entirely.', duration: 15 },
      { label: 'Rest', body: 'The whole body is heavy now. Let it sink. Stay here as long as you like.', duration: 30 },
    ],
  },
  {
    id: '4-7-8',
    title: '4-7-8 Breath',
    tagline: '~3 min · Parasympathetic activation',
    steps: [
      { label: 'Prepare', body: 'Sit or lie down. Place the tip of your tongue on the ridge behind your upper front teeth.', duration: 15 },
      { label: 'Exhale', body: 'Exhale completely through your mouth, making a whoosh sound.', duration: 8 },
      { label: 'Inhale', body: 'Close your mouth. Inhale quietly through your nose for 4 counts.', duration: 8 },
      { label: 'Hold', body: 'Hold your breath for 7 counts.', duration: 10 },
      { label: 'Exhale', body: 'Exhale completely through your mouth for 8 counts.', duration: 10 },
      { label: 'Repeat', body: 'Repeat the cycle three more times. The long exhale is what calms the nervous system.', duration: 20 },
    ],
  },
  {
    id: 'sound-field',
    title: 'Sound field',
    tagline: '~4 min · Mindful listening',
    steps: [
      { label: 'Settle', body: 'Lie down. Close your eyes. Let the body sink into the surface beneath you.', duration: 20 },
      { label: 'Far', body: 'Notice the farthest sounds you can detect — distant traffic, wind, the world beyond.', duration: 25 },
      { label: 'Middle', body: 'Bring attention to sounds at medium distance — a room away, outside a window.', duration: 25 },
      { label: 'Near', body: 'Notice the closest sounds — your own breath, the building, the fabric beneath you.', duration: 25 },
      { label: 'Field', body: 'Let all sounds exist at once, as a field. You are the awareness in which they arise.', duration: 30 },
      { label: 'Rest', body: 'Sound becomes softer as you drift. Let it carry you.', duration: 20 },
    ],
  },
];

export default function SleepPractice() {
  const [selected, setSelected] = useState<typeof WIND_DOWNS[0] | null>(null);
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const moonOpacity = useRef(new Animated.Value(0.4)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running || !selected) return;
    const step = selected.steps[stepIdx];
    setCountdown(step?.duration ?? 20);
    Animated.timing(moonOpacity, { toValue: 0.9, duration: 2000, useNativeDriver: true }).start();
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, stepIdx, selected]);

  function start(w: typeof WIND_DOWNS[0]) {
    setSelected(w);
    setStepIdx(0);
    setRunning(true);
  }

  function next() {
    if (!selected) return;
    if (timerRef.current) clearInterval(timerRef.current);
    if (stepIdx < selected.steps.length - 1) {
      setStepIdx((i) => i + 1);
    } else {
      finish();
    }
  }

  async function finish() {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    await awardResonance('PRACTICE_SLEEP');
    setSelected(null);
    setStepIdx(0);
  }

  if (running && selected) {
    const step = selected.steps[stepIdx]!;
    const progress = selected.steps[stepIdx] ? 1 - (countdown / step.duration) : 1;

    return (
      <SafeAreaView style={styles.root}>
        <LinearGradient colors={['#07090a', '#050708']} style={StyleSheet.absoluteFill} />
        <View style={styles.session}>
          <Animated.Text style={[styles.moonGlyph, { opacity: moonOpacity }]}>☽</Animated.Text>

          <Text style={styles.sessionTitle}>{selected.title}</Text>
          <Text style={styles.stepOf}>{stepIdx + 1} / {selected.steps.length}</Text>

          <GlassCard style={styles.stepCard}>
            <Text style={styles.stepLabel}>{step.label}</Text>
            <Text style={styles.stepBody}>{step.body}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            {countdown > 0 && (
              <Text style={styles.countdownText}>{countdown}s</Text>
            )}
          </GlassCard>

          <GradientButton
            label={stepIdx < selected.steps.length - 1 ? 'Next' : 'Finish'}
            onPress={next}
            variant="teal"
          />
          <Pressable onPress={finish}>
            <Text style={styles.endLink}>End session</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#07090a', '#050708']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Practices</Text>
        </Pressable>
        <Text style={styles.title}>Sleep</Text>
        <Text style={styles.sub}>Wind-down practices to prepare body and mind for rest.</Text>

        <View style={styles.list}>
          {WIND_DOWNS.map((w) => (
            <Pressable key={w.id} onPress={() => start(w)}>
              <GlassCard style={styles.card}>
                <Text style={styles.cardTitle}>{w.title}</Text>
                <Text style={styles.cardTagline}>{w.tagline}</Text>
                <Text style={styles.startLink}>Begin ›</Text>
              </GlassCard>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070a' },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  back: { paddingTop: spacing.lg },
  backText: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.teal },
  title: { fontFamily: font.display, fontSize: 28, color: colors.text },
  sub: { fontFamily: font.serif, fontSize: 15, color: colors.textMuted, lineHeight: 23 },
  list: { gap: spacing.sm },
  card: { padding: spacing.xl, gap: spacing.xs },
  cardTitle: { fontFamily: font.sansBold, fontSize: 16, color: colors.text },
  cardTagline: { fontFamily: font.sans, fontSize: 12, color: colors.textFaint },
  startLink: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.teal, marginTop: spacing.sm },
  session: { flex: 1, padding: spacing.xl, gap: spacing.xl, justifyContent: 'center', alignItems: 'center' },
  moonGlyph: { fontSize: 48, color: colors.indigo },
  sessionTitle: { fontFamily: font.display, fontSize: 22, color: colors.text },
  stepOf: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.textFaint, letterSpacing: 1 },
  stepCard: { padding: spacing.xl, gap: spacing.md, alignSelf: 'stretch' },
  stepLabel: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.indigo, letterSpacing: 1, textTransform: 'uppercase' },
  stepBody: { fontFamily: font.serif, fontSize: 17, color: colors.text, lineHeight: 27 },
  progressBar: { height: 2, backgroundColor: colors.hairline, borderRadius: 1 },
  progressFill: { height: 2, backgroundColor: colors.indigo, borderRadius: 1 },
  countdownText: { fontFamily: font.sansSemibold, fontSize: 12, color: colors.textFaint, textAlign: 'right' },
  endLink: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.textFaint },
});
