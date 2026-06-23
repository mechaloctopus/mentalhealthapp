import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { ModalHeader } from '../src/components/ModalHeader';
import { GradientButton } from '../src/components/GradientButton';
import { Body, Muted, Serif, Label, Display, GlassCard } from '../src/components/ui';
import { useApp } from '../src/context/AppContext';
import { colors, font, radius, spacing } from '../src/theme/theme';
import { select, success, tap } from '../src/lib/haptics';

const STEPS = [
  'Crown of the head', 'Forehead and eyes', 'Jaw and tongue', 'Throat',
  'Shoulders', 'Chest and heart', 'Belly', 'Back',
  'Arms', 'Hands', 'Pelvis', 'Legs', 'Feet', 'The whole body, at once',
];
const STEP_SECONDS = 14;

export default function Stillness() {
  const { addSession } = useApp();
  const [phase, setPhase] = useState<'intro' | 'running' | 'done'>('intro');
  const [index, setIndex] = useState(0);
  const [secs, setSecs] = useState(STEP_SECONDS);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== 'running') return;
    tickRef.current = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          advance();
          return STEP_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const advance = () => {
    setIndex((i) => {
      if (i >= STEPS.length - 1) {
        complete();
        return i;
      }
      select();
      return i + 1;
    });
  };

  const complete = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    success();
    addSession({ kind: 'stillness', minutes: Math.round((STEPS.length * STEP_SECONDS) / 60) });
    setPhase('done');
  };

  const start = () => { tap(); setIndex(0); setSecs(STEP_SECONDS); setPhase('running'); };

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.blue} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ModalHeader title="Perfect Stillness" accent={colors.blue} />

        {phase === 'intro' && (
          <Animated.View entering={FadeIn} style={styles.center}>
            <View style={[styles.badge, { borderColor: colors.blue + '55', backgroundColor: colors.blue + '14' }]}>
              <Ionicons name="moon" size={34} color={colors.blue} />
            </View>
            <Display center style={{ fontSize: 30, marginTop: spacing.lg }}>A slow body scan</Display>
            <Body center style={{ maxWidth: 320, marginTop: spacing.md }}>
              Move awareness gently through the body. Let pleasant sensations pass. Let unpleasant sensations pass. Stay with observation before story.
            </Body>
          </Animated.View>
        )}

        {phase === 'running' && (
          <View style={styles.center}>
            <Muted>{index + 1} of {STEPS.length}</Muted>
            <Animated.View key={index} entering={FadeInDown.duration(500)} style={{ alignItems: 'center' }}>
              <Serif center style={styles.focus}>{STEPS[index]}</Serif>
            </Animated.View>
            <View style={styles.nodes}>
              {STEPS.map((_, i) => (
                <View key={i} style={[styles.node, i === index && styles.nodeActive, i < index && styles.nodeDone]} />
              ))}
            </View>
            <Muted style={{ marginTop: spacing.xl }}>Rest here · {secs}s</Muted>
          </View>
        )}

        {phase === 'done' && (
          <Animated.View entering={FadeIn} style={styles.center}>
            <View style={[styles.badge, { borderColor: colors.moss + '55', backgroundColor: colors.moss + '14' }]}>
              <Ionicons name="checkmark" size={34} color={colors.moss} />
            </View>
            <Display center style={{ fontSize: 28, marginTop: spacing.lg }}>Stillness complete</Display>
            <Body center style={{ maxWidth: 300, marginTop: spacing.md }}>
              Carry a little of this quiet into the next thing you do.
            </Body>
          </Animated.View>
        )}

        <View style={styles.footer}>
          {phase === 'intro' && <GradientButton label="Begin scan" onPress={start} full />}
          {phase === 'running' && (
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <GradientButton label="Next" variant="ghost" onPress={advance} style={{ flex: 1 }} />
              <GradientButton label="End" variant="solid" onPress={complete} style={{ flex: 1 }} />
            </View>
          )}
          {phase === 'done' && <GradientButton label="Done" onPress={() => { tap(); setPhase('intro'); }} full />}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  badge: { width: 84, height: 84, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  focus: { fontSize: 34, lineHeight: 42, marginTop: spacing.lg },
  nodes: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: spacing.xxl, maxWidth: 240 },
  node: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)' },
  nodeActive: { backgroundColor: colors.blue, transform: [{ scale: 1.3 }] },
  nodeDone: { backgroundColor: colors.blue + '66' },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.lg },
});
