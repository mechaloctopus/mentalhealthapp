import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { awardResonance } from '../../src/lib/resonance';
import { colors, font, spacing, radius } from '../../src/theme/tokens';
import { GradientButton } from '../../src/components/GradientButton';

type Pattern = { name: string; phases: { label: string; beats: number }[] };

const PATTERNS: Pattern[] = [
  {
    name: 'Box Breathing',
    phases: [
      { label: 'Inhale', beats: 4 },
      { label: 'Hold', beats: 4 },
      { label: 'Exhale', beats: 4 },
      { label: 'Hold', beats: 4 },
    ],
  },
  {
    name: 'Extended Exhale',
    phases: [
      { label: 'Inhale', beats: 4 },
      { label: 'Exhale', beats: 6 },
    ],
  },
  {
    name: 'Activation',
    phases: [
      { label: 'Inhale', beats: 2 },
      { label: 'Exhale', beats: 2 },
    ],
  },
];

export default function BreathPractice() {
  const [pattern, setPattern] = useState(0);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [beat, setBeat] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [awarded, setAwarded] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pat = PATTERNS[pattern]!;

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setBeat((b) => {
        const maxBeats = pat.phases[phase]!.beats;
        if (b + 1 >= maxBeats) {
          setPhase((p) => {
            const next = (p + 1) % pat.phases.length;
            if (next === 0) setCycles((c) => {
              const newC = c + 1;
              if (newC >= 2 && !awarded) {
                awardResonance('PRACTICE_BREATH');
                setAwarded(true);
              }
              return newC;
            });
            return next;
          });
          return 0;
        }
        return b + 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, phase, pat]);

  useEffect(() => {
    if (!running) return;
    const currentPhase = pat.phases[phase];
    const toScale = currentPhase?.label === 'Inhale' ? 1.35 : 0.85;
    const dur = (currentPhase?.beats ?? 4) * 1000;
    Animated.timing(scale, { toValue: toScale, duration: dur * 0.9, useNativeDriver: true }).start();
  }, [phase, running]);

  function toggle() {
    if (running) {
      if (timerRef.current) clearInterval(timerRef.current);
      setRunning(false);
      setPhase(0);
      setBeat(0);
    } else {
      setCycles(0);
      setAwarded(false);
      setRunning(true);
    }
  }

  const currentPhase = pat.phases[phase];

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />

      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>‹ Practices</Text>
      </Pressable>

      <View style={styles.patternRow}>
        {PATTERNS.map((p, i) => (
          <Pressable key={p.name} onPress={() => { setPattern(i); setRunning(false); setPhase(0); setBeat(0); }}>
            <Text style={[styles.patBtn, pattern === i && styles.patBtnActive]}>{p.name}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.center}>
        <Animated.View style={[styles.orb, { transform: [{ scale }] }]}>
          <LinearGradient
            colors={['#66e0ca', '#7db9ff']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text style={styles.phaseLabel}>{running ? currentPhase?.label : 'Ready'}</Text>
          {running && (
            <Text style={styles.beatCounter}>
              {beat + 1} / {currentPhase?.beats}
            </Text>
          )}
        </Animated.View>

        {running && cycles > 0 && (
          <Text style={styles.cycles}>{cycles} {cycles === 1 ? 'cycle' : 'cycles'}</Text>
        )}

        {awarded && (
          <Text style={styles.resonanceNote}>+8 Resonance earned</Text>
        )}

        <GradientButton
          label={running ? 'Stop' : 'Begin'}
          onPress={toggle}
          variant={running ? 'ghost' : 'teal'}
          style={styles.btn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  back: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  backText: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.teal },
  patternRow: {
    flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg,
    paddingTop: spacing.md, flexWrap: 'wrap',
  },
  patBtn: {
    fontFamily: font.sansSemibold, fontSize: 12, color: colors.textFaint,
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: radius.pill, borderWidth: 1, borderColor: colors.hairline,
  },
  patBtnActive: { color: colors.teal, borderColor: colors.teal },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  orb: {
    width: 180, height: 180, borderRadius: 90,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', gap: spacing.xs,
  },
  phaseLabel: { fontFamily: font.display, fontSize: 22, color: colors.bg, letterSpacing: 0.5 },
  beatCounter: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.bgDeep },
  cycles: { fontFamily: font.serif, fontSize: 14, color: colors.textFaint },
  resonanceNote: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.violet },
  btn: { marginTop: spacing.lg },
});
