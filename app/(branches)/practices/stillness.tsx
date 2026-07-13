import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, font, spacing, radius } from '../../../src/theme/tokens';
import { GlassCard } from '../../../src/components/GlassCard';
import { GradientButton } from '../../../src/components/GradientButton';

const GUIDED = [
  {
    id: 'body-scan',
    title: 'Body Scan',
    duration: 7,
    steps: [
      'Close your eyes and let your breath settle.',
      'Notice the weight of your body on the surface beneath you.',
      'Bring attention to the top of your head. Notice any sensations.',
      'Move slowly down to your forehead, eyes, and jaw. Let them soften.',
      'Scan your shoulders, arms, and hands. Release any holding.',
      'Move to your chest and belly. Notice the rise and fall of breath.',
      'Feel your hips, legs, and feet. Let gravity do the holding.',
      'Rest in the sense of the whole body for a few breaths.',
      'When ready, gently open your eyes.',
    ],
  },
  {
    id: 'grounding-54321',
    title: '5-4-3-2-1 Grounding',
    duration: 4,
    steps: [
      'Name 5 things you can see around you right now.',
      'Name 4 things you can physically feel (the chair, air, your clothes).',
      'Name 3 things you can hear — near, then far.',
      'Name 2 things you can smell, or recall two smells you enjoy.',
      'Name 1 thing you can taste right now.',
      'Take three slow breaths. You are here.',
    ],
  },
  {
    id: 'still-center',
    title: 'The Still Center',
    duration: 5,
    steps: [
      'Sit comfortably and close your eyes.',
      'Notice the feeling of the breath entering and leaving.',
      'Let thoughts pass like clouds across a clear sky.',
      'The sky does not move with the clouds. You are the sky.',
      'When attention follows a thought, return — gently, without judgment.',
      'Rest in the open awareness that is always here.',
      'This is not something to achieve. It is something to notice.',
    ],
  },
];

export default function StillnessPractice() {
  const [selected, setSelected] = useState<typeof GUIDED[0] | null>(null);
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  function start(g: typeof GUIDED[0]) {
    setSelected(g);
    setStepIdx(0);
    setElapsed(0);
    setRunning(true);
  }

  function next() {
    if (!selected) return;
    if (stepIdx < selected.steps.length - 1) setStepIdx((i) => i + 1);
    else finish();
  }

  function finish() {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    setSelected(null);
    setStepIdx(0);
  }

  if (running && selected) {
    return (
      <SafeAreaView style={styles.root}>
        <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
        <View style={styles.session}>
          <Text style={styles.sessionTitle}>{selected.title}</Text>
          <Text style={styles.elapsed}>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</Text>
          <GlassCard style={styles.stepCard}>
            <Text style={styles.stepNum}>{stepIdx + 1} / {selected.steps.length}</Text>
            <Text style={styles.stepText}>{selected.steps[stepIdx]}</Text>
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
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Practices</Text>
        </Pressable>
        <Text style={styles.title}>Stillness</Text>
        <Text style={styles.sub}>Guided practices for the body and mind.</Text>

        <View style={styles.list}>
          {GUIDED.map((g) => (
            <Pressable key={g.id} onPress={() => start(g)}>
              <GlassCard style={styles.card}>
                <Text style={styles.cardTitle}>{g.title}</Text>
                <Text style={styles.cardSub}>~{g.duration} min · {g.steps.length} steps</Text>
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
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  back: { paddingTop: spacing.lg },
  backText: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.teal },
  title: { fontFamily: font.display, fontSize: 28, color: colors.text },
  sub: { fontFamily: font.serif, fontSize: 15, color: colors.textMuted, lineHeight: 23 },
  list: { gap: spacing.sm },
  card: { padding: spacing.xl, gap: spacing.xs },
  cardTitle: { fontFamily: font.sansBold, fontSize: 16, color: colors.text },
  cardSub: { fontFamily: font.sans, fontSize: 13, color: colors.textFaint },
  startLink: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.teal, marginTop: spacing.sm },
  session: { flex: 1, padding: spacing.xl, gap: spacing.xl, justifyContent: 'center' },
  sessionTitle: { fontFamily: font.display, fontSize: 24, color: colors.text, textAlign: 'center' },
  elapsed: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.textFaint, textAlign: 'center' },
  stepCard: { padding: spacing.xl, gap: spacing.sm },
  stepNum: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.textFaint, letterSpacing: 1 },
  stepText: { fontFamily: font.serif, fontSize: 18, color: colors.text, lineHeight: 28 },
  endLink: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.textFaint, textAlign: 'center' },
});
