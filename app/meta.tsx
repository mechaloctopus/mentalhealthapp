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

const PHRASES = ['May you be safe.', 'May you be peaceful.', 'May you be healthy.', 'May you live with ease.'];
const STAGES = [
  { who: 'Yourself', hint: 'Begin where you are. Offer these wishes inward.' },
  { who: 'Someone you love', hint: 'Picture a person whose presence feels warm or steady.' },
  { who: 'A friend or helper', hint: 'Someone who has supported you.' },
  { who: 'A neutral person', hint: 'Someone familiar whom you do not know well.' },
  { who: 'Someone difficult', hint: 'Only if it feels safe. Otherwise stay with a neutral person.' },
  { who: 'All beings', hint: 'Widen the circle in whatever way feels sincere.' },
];
const STAGE_SECONDS = 18;

export default function Meta() {
  const { addSession } = useApp();
  const side = useSide();
  const [phase, setPhase] = useState<'intro' | 'running' | 'done'>('intro');
  const [index, setIndex] = useState(0);
  const [secs, setSecs] = useState(STAGE_SECONDS);
  const [reward, setReward] = useState<'earned' | 'already' | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (phase !== 'running') return;
    tickRef.current = setInterval(() => {
      setSecs((value) => {
        if (value <= 1) {
          advance();
          return STAGE_SECONDS;
        }
        return value - 1;
      });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const advance = () => {
    setIndex((current) => {
      if (current >= STAGES.length - 1) {
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
    const canAward = side.canAwardPractice('meta');
    success();
    addSession({ kind: 'meta', minutes: Math.max(1, Math.round((STAGES.length * STAGE_SECONDS) / 60)) });
    side.completePractice('meta');
    setReward(canAward ? 'earned' : 'already');
    setPhase('done');
  };

  const start = () => {
    tap();
    completedRef.current = false;
    setReward(null);
    setIndex(0);
    setSecs(STAGE_SECONDS);
    setPhase('running');
  };

  const phrase = PHRASES[(STAGE_SECONDS - secs) % PHRASES.length];
  const practiceReward = CORE_PRACTICE_REWARDS.meta;

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.coral} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ModalHeader title="Loving-kindness" accent={colors.coral} />

        {phase === 'intro' && (
          <Animated.View entering={FadeIn} style={styles.center}>
            <View style={[styles.badge, { borderColor: colors.coral + '55', backgroundColor: colors.coral + '14' }]}>
              <Ionicons name="heart" size={34} color={colors.coral} />
            </View>
            <Display center style={{ fontSize: 28, marginTop: spacing.lg }}>Loving-kindness practice</Display>
            <GlassCard accent={colors.coral} style={{ marginTop: spacing.lg }}>
              <Serif center style={{ fontSize: 19, lineHeight: 28 }}>“May I meet myself and others with safety, honesty, and goodwill.”</Serif>
            </GlassCard>
            <Body center style={{ maxWidth: 320, marginTop: spacing.lg }}>Move through six circles of goodwill. Skip or change any stage that does not feel appropriate.</Body>
          </Animated.View>
        )}

        {phase === 'running' && (
          <View style={styles.center}>
            <Muted>{index + 1} of {STAGES.length}</Muted>
            <Animated.View key={index} entering={FadeInDown.duration(500)} style={{ alignItems: 'center', marginTop: spacing.md }}>
              <Label color={colors.coral}>OFFER GOODWILL TO</Label>
              <Serif center style={styles.who}>{STAGES[index].who}</Serif>
              <Muted center style={{ marginTop: 8, maxWidth: 280 }}>{STAGES[index].hint}</Muted>
            </Animated.View>
            <Animated.View key={phrase} entering={FadeIn.duration(600)} style={{ marginTop: spacing.xxl }}>
              <Display center style={{ fontSize: 26 }}>{phrase}</Display>
            </Animated.View>
            <View style={styles.rings} accessible accessibilityLabel={`Circle ${index + 1} of ${STAGES.length}`}>
              {STAGES.map((_, ringIndex) => (
                <View key={ringIndex} style={[styles.ring, { width: 30 + ringIndex * 26, height: 30 + ringIndex * 26, borderRadius: 200, opacity: ringIndex <= index ? 0.7 : 0.15, borderColor: colors.coral }]} />
              ))}
            </View>
          </View>
        )}

        {phase === 'done' && (
          <Animated.View entering={FadeIn} style={styles.center}>
            <View style={[styles.badge, { borderColor: colors.moss + '55', backgroundColor: colors.moss + '14' }]}>
              <Ionicons name="checkmark" size={34} color={colors.moss} />
            </View>
            <Display center style={{ fontSize: 28, marginTop: spacing.lg }}>The circle is complete</Display>
            <Body center style={{ maxWidth: 300, marginTop: spacing.md }}>Carry one sincere wish of goodwill into your next interaction.</Body>
            {reward ? (
              <GlassCard accent={reward === 'earned' ? colors.moss : colors.coral} style={styles.rewardCard}>
                <Label color={reward === 'earned' ? colors.moss : colors.coral}>{reward === 'earned' ? 'INNER PATH ADVANCED' : 'TODAY’S GROWTH RECORDED'}</Label>
                <Body color={colors.text}>{reward === 'earned' ? `+${practiceReward.resonance} resonance · ${practiceReward.label}` : 'This session is saved. Resonance for Loving-kindness is awarded once each day.'}</Body>
              </GlassCard>
            ) : null}
          </Animated.View>
        )}

        <View style={styles.footer}>
          {phase === 'intro' && <GradientButton label="Begin" onPress={start} full />}
          {phase === 'running' && (
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <GradientButton label="Next circle" variant="ghost" onPress={advance} style={{ flex: 1 }} />
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
  who: { fontSize: 32, lineHeight: 40, marginTop: 8 },
  rings: { position: 'absolute', alignItems: 'center', justifyContent: 'center', bottom: -10, opacity: 0.5 },
  ring: { position: 'absolute', borderWidth: 1 },
  rewardCard: { width: '100%', gap: 5, marginTop: spacing.lg },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.lg },
});
