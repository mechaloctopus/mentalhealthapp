import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { Display, Title, Body, Muted, Label, GlassCard, Serif, Row } from '../src/components/ui';
import { GradientButton } from '../src/components/GradientButton';
import { Waveform } from '../src/components/Waveform';
import { SignalBar } from '../src/components/SignalBar';
import { BreathOrb, PATTERNS } from '../src/components/BreathOrb';
import { useApp } from '../src/context/AppContext';
import { useRecorder } from '../src/lib/useRecorder';
import { analyze, type MoodProfile } from '../src/lib/voice';
import { colors, font, radius, spacing } from '../src/theme/theme';
import { success, select, tap } from '../src/lib/haptics';

type Step = 'ready' | 'recording' | 'analyzing' | 'result';

const PROMPTS = [
  'Tell me, in your own words, how today has actually felt so far.',
  'What is one thing on your mind right now, said plainly?',
  'Describe how your body feels in this moment.',
];

const MIN_MS = 6000;
const MAX_MS = 45000;

export default function CheckIn() {
  const router = useRouter();
  const { baseline, addCheckIn } = useApp();
  const rec = useRecorder();
  const [step, setStep] = useState<Step>('ready');
  const [profile, setProfile] = useState<MoodProfile | null>(null);
  const prompt = useRef(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]).current;
  const autoStop = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (step === 'recording' && rec.status === 'recording') {
      autoStop.current = setTimeout(() => finish(), MAX_MS);
      return () => { if (autoStop.current) clearTimeout(autoStop.current); };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, rec.status]);

  const begin = async () => {
    select();
    setStep('recording');
    await rec.start();
  };

  const finish = async () => {
    if (autoStop.current) clearTimeout(autoStop.current);
    const { meters, durationMs } = await rec.stop();
    setStep('analyzing');
    const p = analyze(meters, durationMs, baseline);
    setTimeout(() => {
      setProfile(p);
      addCheckIn({ ...p, id: Math.random().toString(36).slice(2), at: Date.now() });
      success();
      setStep('result');
    }, 1700);
  };

  const close = () => { tap(); router.canGoBack() ? router.back() : router.replace('/(tabs)'); };

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.teal} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable onPress={close} hitSlop={12} style={styles.iconBtn}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </Pressable>
          <Label>VOICE CHECK-IN</Label>
          <View style={{ width: 40 }} />
        </View>

        {step === 'ready' && (
          <Animated.View entering={FadeIn} style={styles.center}>
            <GlassCard accent={colors.teal} style={{ width: '100%', gap: 8 }}>
              <Label>SPEAK FREELY</Label>
              <Serif style={{ fontSize: 22, lineHeight: 31 }}>{prompt}</Serif>
            </GlassCard>
            <Muted center style={{ marginTop: spacing.lg, maxWidth: 300 }}>
              There are no right answers. Speak for about 30 seconds in a natural voice.
            </Muted>
          </Animated.View>
        )}

        {step === 'recording' && (
          <Animated.View entering={FadeIn} style={styles.center}>
            <GlassCard style={{ width: '100%' }}>
              <Muted style={{ marginBottom: 6 }}>Speaking to:</Muted>
              <Serif style={{ fontSize: 19, lineHeight: 27 }}>{prompt}</Serif>
            </GlassCard>
            <View style={{ height: spacing.xxl }} />
            <Waveform active level={rec.level} count={32} />
            <Title style={{ fontFamily: font.serif, fontSize: 34, marginTop: spacing.lg }}>{(rec.durationMs / 1000).toFixed(0)}s</Title>
            {rec.status === 'denied' && (
              <Muted center color={colors.coral} style={{ marginTop: 12, maxWidth: 280 }}>
                Microphone permission is needed. Enable it in Settings to check in by voice.
              </Muted>
            )}
          </Animated.View>
        )}

        {step === 'analyzing' && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.center}>
            <BreathOrb pattern={PATTERNS.calm.pattern} running size={180} accent={colors.lavender} />
            <Serif center style={{ marginTop: spacing.xl }}>Reading your signal…</Serif>
          </Animated.View>
        )}

        {step === 'result' && profile && (
          <Animated.ScrollView
            entering={FadeInDown.duration(500)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}
          >
            <Label center color={colors.teal}>TODAY YOU SOUND</Label>
            <Display center style={{ fontSize: 32, marginTop: 8, marginBottom: spacing.xl }}>{profile.tone}</Display>

            <GlassCard style={{ gap: spacing.lg }}>
              <SignalBar label="Energy" value={profile.energy} color={colors.amber} />
              <SignalBar label="Calmness" value={profile.calmness} color={colors.teal} delay={120} />
              <SignalBar label="Stability" value={profile.stability} color={colors.blue} delay={240} />
              <Row style={{ justifyContent: 'space-between', marginTop: 4 }}>
                <Muted>Stress signal</Muted>
                <Row gap={8}>
                  <View style={[styles.dot, { backgroundColor: profile.stress === 'Elevated' ? colors.coral : profile.stress === 'Mild' ? colors.amber : colors.moss }]} />
                  <Body color={colors.text} style={{ fontFamily: font.sansSemibold }}>{profile.stress}</Body>
                </Row>
              </Row>
              {baseline ? (
                <Row style={{ justifyContent: 'space-between' }}>
                  <Muted>Vs. baseline</Muted>
                  <Body color={profile.baselineShift >= 0 ? colors.moss : colors.coral} style={{ fontFamily: font.sansSemibold }}>
                    {profile.baselineShift >= 0 ? '+' : ''}{profile.baselineShift}
                  </Body>
                </Row>
              ) : null}
            </GlassCard>

            <GlassCard accent={colors.lavender} style={{ marginTop: spacing.lg, gap: 8 }}>
              <Label color={colors.lavender}>ONE GENTLE NEXT STEP</Label>
              <Serif style={{ fontSize: 20 }}>{profile.recommendation.practice}</Serif>
              <Body>{profile.recommendation.reason}</Body>
            </GlassCard>

            <View style={{ height: spacing.xl }} />
            <GradientButton label={`Begin ${profile.recommendation.practice}`} onPress={() => { tap(); router.replace(profile.recommendation.route as any); }} full />
            <View style={{ height: spacing.md }} />
            <GradientButton label="Back to today" variant="ghost" onPress={() => router.replace('/(tabs)')} full />
          </Animated.ScrollView>
        )}

        {(step === 'ready' || step === 'recording') && (
          <View style={styles.footer}>
            {step === 'ready' ? (
              <GradientButton label="Start speaking" onPress={begin} full />
            ) : (
              <GradientButton
                label={rec.status === 'denied' ? 'Close' : 'Finish & analyze'}
                onPress={rec.status === 'denied' ? close : finish}
                disabled={rec.status !== 'denied' && rec.durationMs < MIN_MS}
                full
              />
            )}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  iconBtn: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
