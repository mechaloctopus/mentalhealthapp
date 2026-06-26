import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
import { colors, font, spacing } from '../src/theme/theme';
import { success, select } from '../src/lib/haptics';

type Step = 'intro' | 'settle' | 'capture' | 'analyzing' | 'retry' | 'done';

const READING = '“I can return to peace without rushing the process. My breath gives me a clean place to begin, and I can be honest and gentle at the same time.”';
const MIN_MS = 7000;
const MAX_MS = 35000;

export default function Baseline() {
  const router = useRouter();
  const { setBaseline } = useApp();
  const recorder = useRecorder();
  const [step, setStep] = useState<Step>('intro');
  const [settleCycles, setSettleCycles] = useState(0);
  const [profile, setProfile] = useState<Affect | null>(null);
  const autoStop = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (step === 'capture' && recorder.status === 'recording') {
      autoStop.current = setTimeout(() => finishCapture(), MAX_MS);
      return () => { if (autoStop.current) clearTimeout(autoStop.current); };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, recorder.status]);

  const startCapture = async () => {
    select();
    setStep('capture');
    await recorder.start();
  };

  const finishCapture = async () => {
    if (autoStop.current) clearTimeout(autoStop.current);
    const { meters, durationMs } = await recorder.stop();
    setStep('analyzing');
    const result = analyzeVoice(meters, durationMs);

    setTimeout(async () => {
      if (!result) {
        setProfile(null);
        setStep('retry');
        return;
      }

      setProfile(result);
      await setBaseline({
        energy: result.energy,
        calmness: result.calmness,
        stability: result.stability,
        valence: result.valence,
        arousal: result.arousal,
        capturedAt: Date.now(),
      });
      success();
      setStep('done');
    }, 900);
  };

  if (step === 'intro') {
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <Animated.View entering={FadeInDown.duration(600)} style={{ alignItems: 'center', gap: spacing.lg }}>
          <View style={styles.badge}><Ionicons name="analytics" size={34} color={colors.teal} /></View>
          <Label center>STEP 1 · YOUR BASELINE</Label>
          <Display center style={{ fontSize: 34 }}>Find your calm reference</Display>
          <Body center style={{ maxWidth: 340 }}>
            First a brief guided settle, then a short voice sample. This becomes your private reference point for future comparisons.
          </Body>
        </Animated.View>
        <View style={styles.bottom}>
          <GradientButton label="Begin guided settle" onPress={() => { select(); setStep('settle'); }} full />
          <Muted center style={{ marginTop: 14 }}>The audio envelope is analyzed on-device. Raw audio is not saved by this flow.</Muted>
        </View>
      </Screen>
    );
  }

  if (step === 'settle') {
    const ready = settleCycles >= 2;
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <Animated.View entering={FadeIn} style={{ alignItems: 'center' }}>
          <Label center style={{ marginBottom: 8 }}>GUIDED SETTLE</Label>
          <Serif center style={{ marginBottom: spacing.xl, maxWidth: 300 }}>Follow the orb. Let the exhale be a little longer than the breath in.</Serif>
          <BreathOrb pattern={PATTERNS.calm.pattern} running size={280} onCycle={setSettleCycles} />
          <Muted center style={{ marginTop: spacing.xl }}>{settleCycles} of 2 breaths complete</Muted>
        </Animated.View>
        <View style={styles.bottom}>
          <GradientButton label={ready ? 'Continue to voice sample' : 'Continue when ready'} onPress={startCapture} full />
        </View>
      </Screen>
    );
  }

  if (step === 'capture') {
    const enough = recorder.durationMs >= MIN_MS;
    const denied = recorder.status === 'denied';
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <Animated.View entering={FadeIn} style={{ alignItems: 'center', gap: spacing.lg, width: '100%' }}>
          <Label center>VOICE BASELINE</Label>
          <GlassCard style={{ width: '100%' }} accent={colors.teal}>
            <Muted style={{ marginBottom: 8 }}>Read this softly, at your natural pace:</Muted>
            <Serif style={{ fontSize: 20, lineHeight: 30 }}>{READING}</Serif>
          </GlassCard>
          <Waveform active={recorder.status === 'recording'} level={recorder.level} />
          <Title style={{ fontFamily: font.serif, fontSize: 30 }}>{(recorder.durationMs / 1000).toFixed(0)}s</Title>
          {denied ? (
            <Muted center color={colors.coral}>Microphone permission is needed for a voice baseline.</Muted>
          ) : (
            <Muted center>{enough ? 'Finish when ready.' : 'Keep speaking for a few more seconds.'}</Muted>
          )}
        </Animated.View>
        <View style={styles.bottom}>
          <GradientButton label={denied ? 'Skip baseline for now' : 'Finish baseline'} onPress={denied ? () => router.replace('/(tabs)') : finishCapture} disabled={!denied && !enough} full />
        </View>
      </Screen>
    );
  }

  if (step === 'analyzing') {
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <Animated.View entering={FadeIn} exiting={FadeOut} style={{ alignItems: 'center', gap: spacing.lg }}>
          <BreathOrb pattern={PATTERNS.calm.pattern} running size={180} accent={colors.lavender} />
          <Serif center>Checking sample quality…</Serif>
          <Muted center style={{ maxWidth: 280 }}>A result is only created when the microphone captured enough usable variation.</Muted>
        </Animated.View>
      </Screen>
    );
  }

  if (step === 'retry') {
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <Animated.View entering={FadeInDown.duration(450)} style={{ alignItems: 'center', gap: spacing.lg, width: '100%' }}>
          <View style={[styles.badge, { borderColor: colors.amber + '66', backgroundColor: colors.amber + '12' }]}>
            <Ionicons name="mic-off-outline" size={34} color={colors.amber} />
          </View>
          <Display center style={{ fontSize: 30 }}>We could not read that sample</Display>
          <Body center style={{ maxWidth: 330 }}>Try again in a quieter place, hold the phone a little closer, and speak naturally. No baseline was saved.</Body>
          <GradientButton label="Try again" onPress={startCapture} full />
          <GradientButton label="Skip baseline for now" variant="ghost" onPress={() => router.replace('/(tabs)')} full />
        </Animated.View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false} contentStyle={styles.center}>
      <Animated.View entering={FadeInDown.duration(600)} style={{ alignItems: 'center', gap: spacing.md, width: '100%' }}>
        <View style={[styles.badge, { borderColor: colors.moss + '55' }]}><Ionicons name="checkmark" size={36} color={colors.moss} /></View>
        <Display center style={{ fontSize: 30 }}>Baseline saved</Display>
        <Body center style={{ maxWidth: 320, marginBottom: spacing.md }}>Future voice check-ins can now be compared with this private reference.</Body>
        {profile ? (
          <GlassCard style={{ width: '100%', gap: spacing.lg }}>
            <SignalBar label="Energy" value={profile.energy} color={colors.amber} />
            <SignalBar label="Calmness" value={profile.calmness} color={colors.teal} delay={120} />
            <SignalBar label="Stability" value={profile.stability} color={colors.blue} delay={240} />
          </GlassCard>
        ) : null}
      </Animated.View>
      <View style={styles.bottom}><GradientButton label="Enter MoodSignal" onPress={() => router.replace('/(tabs)')} full /></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg },
  badge: { width: 84, height: 84, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(102,224,202,0.12)', borderWidth: 1, borderColor: colors.teal + '55' },
  bottom: { position: 'absolute', bottom: spacing.xl, left: spacing.lg, right: spacing.lg },
});
