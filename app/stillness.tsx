import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { ModalHeader } from '../src/components/ModalHeader';
import { GradientButton } from '../src/components/GradientButton';
import { Body, Muted, Serif, Display, GlassCard, Label } from '../src/components/ui';
import { useApp } from '../src/context/AppContext';
import { CORE_PRACTICE_REWARDS, useSide } from '../src/side/SideContext';
import { colors, spacing } from '../src/theme/theme';
import { select, success, tap } from '../src/lib/haptics';

const STEPS = [
  'Crown of the head', 'Forehead and eyes', 'Jaw and tongue', 'Throat',
  'Shoulders', 'Chest and heart', 'Belly', 'Back',
  'Arms', 'Hands', 'Pelvis', 'Legs', 'Feet', 'The whole body, at once',
];
const STEP_SECONDS = 14;

export default function Stillness() {
  const { addSession } = useApp();
  const side = useSide();
  const [phase, setPhase] = useState<'intro' | 'running' | 'done'>('intro');
  const [index, setIndex] = useState(0);
  const [secs, setSecs] = useState(STEP_SECONDS);
  const [reward, setReward] = useState<'earned' | 'already' | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (phase !== 'running') return;
    tickRef.current = setInterval(() => {
      setSecs((value) => {
        if (value <= 1) {
          advance();
          return STEP_SECONDS;
        }
        return value - 1;
      });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const advance = () => {
    setIndex((current) => {
      if (current >= STEPS.length - 1) {
        complete();
        return current;
      }
      select();
      return current + 1;
    });
  };

  const complete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (tickRef.current) clearInterval(tickRef.current);
    const canAward = side.canAwardPractice('stillness');
    success();
    addSession({ kind: 'stillness', minutes: Math.round((STEPS.length * STEP_SECONDS) / 60) });
    side.completePractice('stillness');
    setReward(canAward ? 'earned' : 'already');
    setPhase('done');
  };

  const start = () => {
    tap();
    completedRef.current = false;
    setReward(null);
    setIndex(0);
    setSecs(STEP_SECONDS);
    setPhase('running');
  };

  const practiceReward = CORE_PRACTICE_REWARDS.stillness;

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
              Move awareness gently through the body. Let sensations pass. Stay with observation before story.
            </Body>
          </Animated.View>
        )}

        {phase === 'running' && (
          <View style={styles.center}>
            <Muted>{index + 1} of {STEPS.length}</Muted>
            <Animated.View key={index} entering={FadeInDown.duration(500)} style={{ alignItems: 'center' }}>
              <Serif center style={styles.focus}>{STEPS[index]}</Serif>
            </Animated.View>
            <View style={styles.nodes} accessible accessibilityLabel={`Step ${index + 1} of ${STEPS.length}`}>
              {STEPS.map((_, stepIndex) => (
                <View key={stepIndex} style={[styles.node, stepIndex === index && styles.nodeActive, stepIndex < index && styles.nodeDone]} />
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
            <Body center style={{ maxWidth: 300, marginTop: spacing.md }}>Carry a little of this quiet into the next thing you do.</Body>
            {reward ? (
              <GlassCard accent={reward === 'earned' ? colors.moss : colors.blue} style={styles.rewardCard}>
                <Label color={reward === 'earned' ? colors.moss : colors.blue}>{reward === 'earned' ? 'INNER PATH ADVANCED' : 'TODAY’S GROWTH RECORDED'}</Label>
                <Body color={colors.text}>{reward === 'earned' ? `+${practiceReward.resonance} resonance · ${practiceReward.label}` : 'This session is saved. Resonance for Stillness is awarded once each day.'}</Body>
              </GlassCard>
            ) : null}
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
          {phase === 'done' && <GradientButton label="Practice again" onPress={start} full />}
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
  rewardCard: { width: '100%', gap: 5, marginTop: spacing.lg },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.lg },
});
