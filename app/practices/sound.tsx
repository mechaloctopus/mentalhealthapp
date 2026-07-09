import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { awardResonance } from '../../src/lib/resonance';
import { GlassCard } from '../../src/components/GlassCard';
import { GradientButton } from '../../src/components/GradientButton';
import { colors, font, spacing, radius } from '../../src/theme/tokens';

const SESSIONS = [
  {
    id: 'calming',
    label: 'Calming',
    glyph: '〜',
    color: colors.teal,
    duration: 300,
    prompts: [
      'Find a comfortable position and close your eyes.',
      'Notice the sounds closest to you — let them pass without holding.',
      'Let distant sounds arise and dissolve like waves.',
      'You are the space in which sound arises. Not the sound itself.',
      'Rest in the silence between each sound.',
      'When ready, slowly open your eyes.',
    ],
  },
  {
    id: 'focus',
    label: 'Focus',
    glyph: '◎',
    color: colors.blue,
    duration: 600,
    prompts: [
      'Sit upright. Eyes can be open or softly closed.',
      'Notice the ambient soundscape — let it anchor your attention.',
      'Each time the mind wanders, use sound as the return point.',
      'Sound is always here. It is a reliable anchor.',
      'Stay with the texture of what you hear, moment by moment.',
      'You have been focused. Rest in that.',
    ],
  },
  {
    id: 'uplift',
    label: 'Uplift',
    glyph: '↑',
    color: colors.amber,
    duration: 180,
    prompts: [
      'Let your posture open — shoulders back, chest soft.',
      'Notice the highest-pitched sounds you can hear.',
      'Feel the brightness of sound — how it lifts the attention upward.',
      'Let your breath match the rhythm of what you hear.',
      'Carry this aliveness into whatever comes next.',
    ],
  },
] as const;

export default function SoundPractice() {
  const [selected, setSelected] = useState<typeof SESSIONS[number] | null>(null);
  const [running, setRunning] = useState(false);
  const [promptIdx, setPromptIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [awarded, setAwarded] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (selected && next >= selected.duration && !awarded) {
          awardResonance('PRACTICE_SOUND');
          setAwarded(true);
        }
        return next;
      });
    }, 1000);
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.92, duration: 2000, useNativeDriver: true }),
      ])
    );
    pulseRef.current.start();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pulseRef.current) pulseRef.current.stop();
    };
  }, [running]);

  function start(s: typeof SESSIONS[number]) {
    setSelected(s);
    setPromptIdx(0);
    setElapsed(0);
    setAwarded(false);
    setRunning(true);
  }

  function next() {
    if (!selected) return;
    if (promptIdx < selected.prompts.length - 1) {
      setPromptIdx((i) => i + 1);
    } else {
      finish();
    }
  }

  async function finish() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pulseRef.current) pulseRef.current.stop();
    setRunning(false);
    if (!awarded) {
      await awardResonance('PRACTICE_SOUND');
      setAwarded(true);
    }
    setSelected(null);
    setPromptIdx(0);
  }

  const remaining = selected ? Math.max(0, selected.duration - elapsed) : 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  if (running && selected) {
    return (
      <SafeAreaView style={styles.root}>
        <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
        <View style={styles.session}>
          <Text style={[styles.sessionLabel, { color: selected.color }]}>{selected.label}</Text>

          <Animated.View style={[styles.pulseOrb, { transform: [{ scale: pulse }], borderColor: selected.color }]}>
            <Text style={[styles.pulseGlyph, { color: selected.color }]}>{selected.glyph}</Text>
            <Text style={styles.timer}>{minutes}:{String(seconds).padStart(2, '0')}</Text>
          </Animated.View>

          <GlassCard style={styles.promptCard}>
            <Text style={styles.promptNum}>{promptIdx + 1} / {selected.prompts.length}</Text>
            <Text style={styles.promptText}>{selected.prompts[promptIdx]}</Text>
          </GlassCard>

          <GradientButton
            label={promptIdx < selected.prompts.length - 1 ? 'Next' : 'Finish'}
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
        <Text style={styles.title}>Sound</Text>
        <Text style={styles.sub}>Mindful listening sessions — use your natural environment or any ambient audio.</Text>

        <View style={styles.list}>
          {SESSIONS.map((s) => (
            <Pressable key={s.id} onPress={() => start(s)}>
              <GlassCard style={styles.card}>
                <Text style={[styles.cardGlyph, { color: s.color }]}>{s.glyph}</Text>
                <View style={styles.cardText}>
                  <Text style={[styles.cardLabel, { color: s.color }]}>{s.label}</Text>
                  <Text style={styles.cardDur}>~{s.duration / 60} min · {s.prompts.length} prompts</Text>
                </View>
                <Text style={styles.cardArrow}>›</Text>
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
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  cardGlyph: { fontSize: 28, width: 36, textAlign: 'center' },
  cardText: { flex: 1, gap: 3 },
  cardLabel: { fontFamily: font.sansSemibold, fontSize: 15 },
  cardDur: { fontFamily: font.sans, fontSize: 13, color: colors.textFaint },
  cardArrow: { fontSize: 20, color: colors.textFaint },
  session: { flex: 1, padding: spacing.xl, gap: spacing.xl, justifyContent: 'center', alignItems: 'center' },
  sessionLabel: { fontFamily: font.sansSemibold, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  pulseOrb: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    backgroundColor: colors.surface1,
  },
  pulseGlyph: { fontSize: 36 },
  timer: { fontFamily: font.sansSemibold, fontSize: 16, color: colors.textFaint },
  promptCard: { padding: spacing.xl, gap: spacing.sm, alignSelf: 'stretch' },
  promptNum: { fontFamily: font.sansSemibold, fontSize: 10, color: colors.textFaint, letterSpacing: 1 },
  promptText: { fontFamily: font.serif, fontSize: 16, color: colors.text, lineHeight: 26 },
  endLink: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.textFaint },
});
