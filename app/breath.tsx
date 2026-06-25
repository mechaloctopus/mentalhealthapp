import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { ModalHeader } from '../src/components/ModalHeader';
import { BreathOrb, PATTERNS } from '../src/components/BreathOrb';
import { GradientButton } from '../src/components/GradientButton';
import { Body, Muted, Serif, Label } from '../src/components/ui';
import { useApp } from '../src/context/AppContext';
import { colors, font, radius, spacing } from '../src/theme/theme';
import { select, success } from '../src/lib/haptics';

const DURATIONS = [
  { label: '4 min', minutes: 4 },
  { label: '10 min', minutes: 10 },
  { label: '20 min', minutes: 20 },
];

const PATTERN_KEYS = Object.keys(PATTERNS);

export default function Breath() {
  const { addSession } = useApp();
  const [patternKey, setPatternKey] = useState('calm');
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (running && elapsed >= duration.minutes * 60) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  const finish = () => {
    setRunning(false);
    if (elapsed > 20) {
      success();
      addSession({ kind: 'breath', minutes: Math.round(elapsed / 60) });
    }
  };

  const pattern = PATTERNS[patternKey].pattern;

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.teal} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ModalHeader title="Breath" accent={colors.teal} right={running ? <Body color={colors.teal} style={{ fontFamily: font.sansSemibold }}>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</Body> : undefined} />

        <View style={styles.center}>
          <Animated.View entering={FadeIn}>
            <BreathOrb pattern={pattern} running={running} size={300} accent={colors.teal} onCycle={setCycles} />
          </Animated.View>
          {running ? (
            <Muted style={{ marginTop: spacing.xl }}>{cycles} breaths · {Math.floor(elapsed / 60)}m {elapsed % 60}s</Muted>
          ) : (
            <Serif center style={{ marginTop: spacing.xl, maxWidth: 300 }}>
              Watch the breath. When the mind wanders, return gently.
            </Serif>
          )}
        </View>

        {!running && (
          <Animated.View entering={FadeIn} style={styles.controls}>
            <Label style={{ marginBottom: 10 }}>PATTERN</Label>
            <View style={styles.pills}>
              {PATTERN_KEYS.map((k) => (
                <Pressable key={k} onPress={() => { select(); setPatternKey(k); }} style={[styles.pill, patternKey === k && styles.pillActive]}>
                  <Body color={patternKey === k ? colors.black : colors.textMuted} style={{ fontFamily: font.sansSemibold, fontSize: 13 }}>{PATTERNS[k].label}</Body>
                </Pressable>
              ))}
            </View>
            <Label style={{ marginTop: spacing.lg, marginBottom: 10 }}>DURATION</Label>
            <View style={styles.pills}>
              {DURATIONS.map((d) => (
                <Pressable key={d.label} onPress={() => { select(); setDuration(d); }} style={[styles.pill, duration.label === d.label && styles.pillActive]}>
                  <Body color={duration.label === d.label ? colors.black : colors.textMuted} style={{ fontFamily: font.sansSemibold, fontSize: 13 }}>{d.label}</Body>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        <View style={styles.footer}>
          <GradientButton
            label={running ? 'End session' : 'Begin'}
            variant={running ? 'ghost' : 'brand'}
            onPress={() => { if (running) finish(); else { setElapsed(0); setCycles(0); setRunning(true); } }}
            full
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  controls: { paddingHorizontal: spacing.lg },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.panelBorder, backgroundColor: 'rgba(255,255,255,0.04)' },
  pillActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
});
