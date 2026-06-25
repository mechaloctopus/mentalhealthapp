import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { Screen, Display, Title, Body, Muted, Label, GlassCard, Serif } from '../src/components/ui';
import { GradientButton } from '../src/components/GradientButton';
import { BreathOrb, PATTERNS } from '../src/components/BreathOrb';
import { Waveform } from '../src/components/Waveform';
import { SignalBar } from '../src/components/SignalBar';
import { useApp } from '../src/context/AppContext';
import { useRecorder } from '../src/lib/useRecorder';
import { analyzeVoice, type Affect } from '../src/lib/voice';
import { colors, font, radius, spacing } from '../src/theme/theme';
import { success, select } from '../src/lib/haptics';

type Step = 'intro' | 'settle' | 'capture' | 'analyzing' | 'done';

const READING =
  '“I can return to peace without rushing the process. My breath gives me a clean place to begin, and I can be honest and gentle at the same time.”';

const MIN_MS = 7000;
const MAX_MS = 35000;

export default function Baseline() {
  const router = useRouter();
  const { setBaseline } = useApp();
  const rec = useRecorder();
  const [step, setStep] = useState<Step>('intro');
  const [settleCycles, setSettleCycles] = useState(0);
  const [profile, setProfile] = useState<Affect | null>(null);
  const autoStop = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-stop the capture once we have enough audio.
  useEffect(() => {
    if (step === 'capture' && rec.status === 'recording') {
      autoStop.current = setTimeout(() => finishCapture(), MAX_MS);
      return () => {
        if (autoStop.current) clearTimeout(autoStop.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, rec.status]);

  const startCapture = async () => {
    select();
    setStep('capture');
    await rec.start();
  };

  const finishCapture = async () => {
    if (autoStop.current) clearTimeout(autoStop.current);
    const { meters, durationMs } = await rec.stop();
    setStep('analyzing');
    const p = analyzeVoice(meters, durationMs);
    // Let the analyzing animation breathe for a beat.
    setTimeout(async () => {
      setProfile(p);
      await setBaseline({
        energy: p.energy,
        calmness: p.calmness,
        stability: p.stability,
        valence: p.valence,
        arousal: p.arousal,
        capturedAt: Date.now(),
      });
      success();
      setStep('done');
    }, 1700);
  };

  /* -------- INTRO -------- */
  if (step === 'intro') {
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <Animated.View entering={FadeInDown.duration(600)} style={{ alignItems: 'center', gap: spacing.lg }}>
          <View style={styles.badge}>
            <Ionicons name="analytics" size={34} color={colors.teal} />
          </View>
          <Label center>STEP 1 · YOUR BASELINE</Label>
          <Display center style={{ fontSize: 34 }}>Let’s find your calm baseline</Display>
          <Body center style={{ maxWidth: 340 }}>
            First a one-minute guided settle, then a short voice sample. This becomes your private reference point — so future check-ins can show how you’re shifting.
          </Body>
        </Animated.View>
        <View style={styles.introBottom}>
          <GradientButton label="Begin guided settle" onPress={() => { select(); setStep('settle'); }} full />
          <Muted center style={{ marginTop: 14 }}>Audio is analyzed on-device. Nothing is uploaded.</Muted>
        </View>
      </Screen>
    );
  }

  /* -------- SETTLE -------- */
  if (step === 'settle') {
    const ready = settleCycles >= 2;
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <Animated.View entering={FadeIn} style={{ alignItems: 'center' }}>
          <Label center style={{ marginBottom: 8 }}>GUIDED SETTLE</Label>
          <Serif center style={{ marginBottom: spacing.xl, maxWidth: 300 }}>
            Follow the orb. Let the exhale be a little longer than the breath in.
          </Serif>
          <BreathOrb pattern={PATTERNS.calm.pattern} running size={280} onCycle={setSettleCycles} />
          <Muted center style={{ marginTop: spacing.xl }}>{settleCycles} of 2 breaths complete</Muted>
        </Animated.View>
        <View style={styles.introBottom}>
          <GradientButton
            label={ready ? 'I feel settled — continue' : 'Continue when ready'}
            onPress={startCapture}
            full
          />
        </View>
      </Screen>
    );
  }

  /* -------- CAPTURE -------- */
  if (step === 'capture') {
    const enough = rec.durationMs >= MIN_MS;
    const denied = rec.status === 'denied';
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <Animated.View entering={FadeIn} style={{ alignItems: 'center', gap: spacing.lg, width: '100%' }}>
          <Label center>STEP 1 · VOICE BASELINE</Label>
          <GlassCard style={{ width: '100%' }} accent={colors.teal}>
            <Muted style={{ marginBottom: 8 }}>Read this softly, at your natural pace:</Muted>
            <Serif style={{ fontSize: 20, lineHeight: 30 }}>{READING}</Serif>
          </GlassCard>
          <Waveform active={rec.status === 'recording'} level={rec.level} />
          <Title style={{ fontFamily: font.serif, fontSize: 30 }}>{(rec.durationMs / 1000).toFixed(0)}s</Title>
          {denied ? (
            <Muted center color={colors.coral}>Microphone permission is needed for the voice baseline. You can enable it in Settings.</Muted>
          ) : (
            <Muted center>{enough ? 'Great — finish whenever you’re ready.' : 'Keep going for a few more seconds…'}</Muted>
          )}
        </Animated.View>
        <View style={styles.introBottom}>
          <GradientButton
            label={denied ? 'Skip for now' : 'Finish baseline'}
            onPress={denied ? () => router.replace('/(tabs)') : finishCapture}
            disabled={!denied && !enough}
            full
          />
        </View>
      </Screen>
    );
  }

  /* -------- ANALYZING -------- */
  if (step === 'analyzing') {
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <Animated.View entering={FadeIn} exiting={FadeOut} style={{ alignItems: 'center', gap: spacing.lg }}>
          <BreathOrb pattern={PATTERNS.calm.pattern} running size={180} accent={colors.lavender} />
          <Serif center>Reading your signal…</Serif>
          <Muted center style={{ maxWidth: 280 }}>Estimating energy, calmness, and stability from your voice.</Muted>
        </Animated.View>
      </Screen>
    );
  }

  /* -------- DONE -------- */
  return (
    <Screen scroll={false} contentStyle={styles.center}>
      <Animated.View entering={FadeInDown.duration(600)} style={{ alignItems: 'center', gap: spacing.md, width: '100%' }}>
        <View style={[styles.badge, { borderColor: colors.moss + '55' }]}>
          <Ionicons name="checkmark" size={36} color={colors.moss} />
        </View>
        <Display center style={{ fontSize: 30 }}>Baseline saved</Display>
        <Body center style={{ maxWidth: 320, marginBottom: spacing.md }}>
          This is your private reference. Future check-ins will compare against it to reveal your trend.
        </Body>
        {profile && (
          <GlassCard style={{ width: '100%', gap: spacing.lg }}>
            <SignalBar label="Energy" value={profile.energy} color={colors.amber} />
            <SignalBar label="Calmness" value={profile.calmness} color={colors.teal} delay={120} />
            <SignalBar label="Stability" value={profile.stability} color={colors.blue} delay={240} />
          </GlassCard>
        )}
      </Animated.View>
      <View style={styles.introBottom}>
        <GradientButton label="Enter MoodSignal" onPress={() => router.replace('/(tabs)')} full />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg },
  badge: {
    width: 84, height: 84, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(102,224,202,0.12)', borderWidth: 1, borderColor: colors.teal + '55',
  },
  introBottom: { position: 'absolute', bottom: spacing.xl, left: spacing.lg, right: spacing.lg },
});
