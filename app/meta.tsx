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
import { colors, spacing } from '../src/theme/theme';
import { select, success, tap } from '../src/lib/haptics';

const PHRASES = ['May you be safe.', 'May you be peaceful.', 'May you be healthy.', 'May you live with ease.'];

const STAGES = [
  { who: 'Yourself', hint: 'Begin where you are. Offer these wishes inward.' },
  { who: 'Someone you love', hint: 'Picture core family or a dear friend.' },
  { who: 'A friend or helper', hint: 'Someone who has supported you.' },
  { who: 'A difficult person', hint: 'Someone who has wounded you, held gently.' },
  { who: 'A stranger', hint: 'Someone you passed today, unknown to you.' },
  { who: 'All beings', hint: 'Widen the circle to include everyone, everywhere.' },
];
const STAGE_SECONDS = 18;

export default function Meta() {
  const { addSession } = useApp();
  const [phase, setPhase] = useState<'intro' | 'running' | 'done'>('intro');
  const [index, setIndex] = useState(0);
  const [secs, setSecs] = useState(STAGE_SECONDS);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== 'running') return;
    tickRef.current = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          advance();
          return STAGE_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const advance = () => {
    setIndex((i) => {
      if (i >= STAGES.length - 1) { complete(); return i; }
      select();
      return i + 1;
    });
  };

  const complete = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    success();
    addSession({ kind: 'meta', minutes: Math.round((STAGES.length * STAGE_SECONDS) / 60) });
    setPhase('done');
  };

  const start = () => { tap(); setIndex(0); setSecs(STAGE_SECONDS); setPhase('running'); };
  const phrase = PHRASES[(STAGE_SECONDS - secs) % PHRASES.length];

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
            <Display center style={{ fontSize: 28, marginTop: spacing.lg }}>Meta meditation</Display>
            <GlassCard accent={colors.coral} style={{ marginTop: spacing.lg }}>
              <Serif center style={{ fontSize: 19, lineHeight: 28 }}>
                “I forgive all who have trespassed against me, and I ask forgiveness from all whom I have trespassed.”
              </Serif>
            </GlassCard>
            <Body center style={{ maxWidth: 320, marginTop: spacing.lg }}>
              We’ll move through six circles of goodwill — from yourself outward to all beings.
            </Body>
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
            <View style={styles.rings}>
              {STAGES.map((_, i) => (
                <View key={i} style={[styles.ring, { width: 30 + i * 26, height: 30 + i * 26, borderRadius: 200, opacity: i <= index ? 0.7 : 0.15, borderColor: colors.coral }]} />
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
            <Body center style={{ maxWidth: 300, marginTop: spacing.md }}>
              You can bless your life without needing it to be perfect.
            </Body>
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
          {phase === 'done' && <GradientButton label="Done" onPress={() => { tap(); setPhase('intro'); }} full />}
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
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.lg },
});
