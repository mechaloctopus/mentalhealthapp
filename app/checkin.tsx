import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { Title, Body, Muted, Label, GlassCard, Serif, Row } from '../src/components/ui';
import { GradientButton } from '../src/components/GradientButton';
import { Waveform } from '../src/components/Waveform';
import { SignalBar } from '../src/components/SignalBar';
import { BreathOrb, PATTERNS } from '../src/components/BreathOrb';
import { EmotionWheel } from '../src/components/EmotionWheel';
import { EmotionAura } from '../src/components/EmotionAura';
import { FactorPicker } from '../src/components/FactorPicker';
import { useApp } from '../src/context/AppContext';
import { useSide } from '../src/side/SideContext';
import { useRecorder } from '../src/lib/useRecorder';
import { analyzeVoice, buildCheckIn, type Affect, type CheckIn } from '../src/lib/voice';
import { getEmotion, matchEmotion } from '../src/lib/emotions';
import { recommendationFromCheckIn } from '../src/lib/recommendationEngine';
import { matchSideQuest } from '../src/lib/sideQuestMatcher';
import { colors, font, radius, spacing } from '../src/theme/theme';
import { success, select, tap } from '../src/lib/haptics';

type Step = 'ready' | 'recording' | 'analyzing' | 'confirm' | 'result';

const PROMPTS = [
  'Tell me, in your own words, how today has actually felt so far.',
  'What is one thing on your mind right now, said plainly?',
  'Describe how your body feels in this moment.',
];

const MIN_MS = 6000;
const MAX_MS = 45000;

function routeForSession(kind: string): string {
  return kind === 'breath' ? '/breath' : kind === 'stillness' ? '/stillness' : kind === 'meta' ? '/meta' : '/sound';
}

export default function CheckIn() {
  const router = useRouter();
  const { baseline, addCheckIn, sessions } = useApp();
  const side = useSide();
  const recorder = useRecorder();
  const [step, setStep] = useState<Step>('ready');
  const [affect, setAffect] = useState<Affect | null>(null);
  const [selfEmotion, setSelfEmotion] = useState<string | undefined>(undefined);
  const [factors, setFactors] = useState<string[]>([]);
  const [checkin, setCheckin] = useState<CheckIn | null>(null);
  const [sampleError, setSampleError] = useState(false);
  const prompt = useRef(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]).current;
  const autoStop = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recentPracticeRoutes = useMemo(() => sessions.slice(0, 6).map((session) => routeForSession(session.kind)), [sessions]);
  const nextStep = useMemo(
    () => (checkin ? recommendationFromCheckIn(checkin, { baseline, recentPracticeRoutes }) : null),
    [baseline, checkin, recentPracticeRoutes]
  );
  const quest = useMemo(() => {
    if (!checkin) return null;
    return matchSideQuest({
      emotionId: checkin.emotion,
      stress: checkin.stress,
      energy: checkin.energy,
      calmness: checkin.calmness,
      stability: checkin.stability,
      factors: checkin.factors,
      activePaths: side.activePaths,
      dailyQuestIds: side.daily.questIds,
      doneToday: side.daily.done,
      completedQuestIds: Object.keys(side.completions),
    });
  }, [checkin, side.activePaths, side.completions, side.daily.done, side.daily.questIds]);

  useEffect(() => {
    if (step === 'recording' && recorder.status === 'recording') {
      autoStop.current = setTimeout(() => finish(), MAX_MS);
      return () => { if (autoStop.current) clearTimeout(autoStop.current); };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, recorder.status]);

  const begin = async () => {
    select();
    setSampleError(false);
    setStep('recording');
    await recorder.start();
  };

  const finish = async () => {
    if (autoStop.current) clearTimeout(autoStop.current);
    const { meters, durationMs } = await recorder.stop();
    setStep('analyzing');
    const result = analyzeVoice(meters, durationMs);

    setTimeout(() => {
      if (!result) {
        setAffect(null);
        setSelfEmotion(undefined);
        setSampleError(true);
        setStep('ready');
        return;
      }
      setAffect(result);
      setSelfEmotion(result.voiceEmotion);
      setStep('confirm');
    }, 900);
  };

  const confirm = () => {
    if (!affect) return;
    const saved = buildCheckIn({ affect, baseline, selfEmotion, factors });
    setCheckin(saved);
    addCheckIn(saved);
    success();
    setStep('result');
  };

  const close = () => {
    tap();
    router.canGoBack() ? router.back() : router.replace('/(tabs)');
  };

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={checkin ? getEmotion(checkin.emotion).color : affect ? getEmotion(affect.voiceEmotion).color : colors.teal} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable onPress={close} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close voice check-in">
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </Pressable>
          <Label>VOICE CHECK-IN</Label>
          <View style={{ width: 40 }} />
        </View>

        {step === 'ready' && (
          <Animated.View entering={FadeIn} style={styles.center}>
            {sampleError ? (
              <GlassCard accent={colors.amber} style={{ width: '100%', gap: 8, marginBottom: spacing.md }}>
                <Label color={colors.amber}>SAMPLE UNCLEAR</Label>
                <Serif style={{ fontSize: 20 }}>We could not read enough usable voice variation.</Serif>
                <Body>Try again in a quieter place, hold the phone a little closer, or continue without voice.</Body>
              </GlassCard>
            ) : null}
            <GlassCard accent={colors.teal} style={{ width: '100%', gap: 8 }}>
              <Label>SPEAK FREELY</Label>
              <Serif style={{ fontSize: 22, lineHeight: 31 }}>{prompt}</Serif>
            </GlassCard>
            <Muted center style={{ marginTop: spacing.lg, maxWidth: 300 }}>Speak naturally for about 30 seconds. A result is only created when the sample is usable.</Muted>
          </Animated.View>
        )}

        {step === 'recording' && (
          <Animated.View entering={FadeIn} style={styles.center}>
            <GlassCard style={{ width: '100%' }}>
              <Muted style={{ marginBottom: 6 }}>Speaking to:</Muted>
              <Serif style={{ fontSize: 19, lineHeight: 27 }}>{prompt}</Serif>
            </GlassCard>
            <View style={{ height: spacing.xxl }} />
            <Waveform active level={recorder.level} count={32} />
            <Title style={{ fontFamily: font.serif, fontSize: 34, marginTop: spacing.lg }}>{(recorder.durationMs / 1000).toFixed(0)}s</Title>
            {recorder.status === 'denied' ? (
              <Muted center color={colors.coral} style={{ marginTop: 12, maxWidth: 280 }}>Microphone permission is needed. You can continue without voice.</Muted>
            ) : null}
          </Animated.View>
        )}

        {step === 'analyzing' && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.center}>
            <BreathOrb pattern={PATTERNS.calm.pattern} running size={180} accent={colors.lavender} />
            <Serif center style={{ marginTop: spacing.xl }}>Checking your sample…</Serif>
          </Animated.View>
        )}

        {step === 'confirm' && affect && (
          <Animated.ScrollView entering={FadeInDown.duration(500)} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <Label center color={getEmotion(affect.voiceEmotion).color}>YOUR VOICE SUGGESTED</Label>
            <View style={{ alignItems: 'center', marginVertical: spacing.md }}>
              <EmotionAura emotionId={affect.voiceEmotion} confidence={affect.confidence} size={220} />
            </View>
            <Serif center style={{ fontSize: 18, marginBottom: spacing.lg, paddingHorizontal: spacing.md }}>Does that feel right? Your own selection is the final answer.</Serif>
            <EmotionWheel value={affect.voiceEmotion} onChange={setSelfEmotion} size={300} />
            <Label style={{ marginTop: spacing.xl, marginBottom: 10 }}>WHAT’S SHAPING THIS? (OPTIONAL)</Label>
            <FactorPicker value={factors} onChange={setFactors} accent={getEmotion(selfEmotion ?? affect.voiceEmotion).color} />
            <View style={{ height: spacing.xl }} />
            <GradientButton label="Confirm this feeling" onPress={confirm} full />
            <View style={{ height: 60 }} />
          </Animated.ScrollView>
        )}

        {step === 'result' && checkin && (
          <Animated.ScrollView entering={FadeInDown.duration(500)} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
              <EmotionAura emotionId={checkin.emotion} size={230} subtitle={getEmotion(checkin.emotion).blurb} />
            </View>

            {affect ? (() => {
              const secondary = matchEmotion(affect.valence, affect.arousal).secondary.filter((emotion) => emotion.id !== checkin.emotion);
              return secondary.length ? (
                <View style={styles.secRow}>
                  <Muted style={{ marginRight: 4 }}>Also suggested</Muted>
                  {secondary.map((emotion) => (
                    <View key={emotion.id} style={[styles.secChip, { borderColor: emotion.color + '66' }]}>
                      <View style={[styles.secDot, { backgroundColor: emotion.color }]} />
                      <Body color={colors.text} style={{ fontSize: 12.5 }}>{emotion.label}</Body>
                    </View>
                  ))}
                </View>
              ) : null;
            })() : null}

            <GlassCard style={{ gap: spacing.lg, marginTop: spacing.md }}>
              <SignalBar label="Energy" value={checkin.energy} color={colors.amber} />
              <SignalBar label="Calmness" value={checkin.calmness} color={colors.teal} delay={120} />
              <SignalBar label="Stability" value={checkin.stability} color={colors.blue} delay={240} />
              <Row style={{ justifyContent: 'space-between', marginTop: 4 }}>
                <Muted>Stress signal</Muted>
                <Row gap={8}>
                  <View style={[styles.dot, { backgroundColor: checkin.stress === 'Elevated' ? colors.coral : checkin.stress === 'Mild' ? colors.amber : colors.moss }]} />
                  <Body color={colors.text} style={{ fontFamily: font.sansSemibold }}>{checkin.stress}</Body>
                </Row>
              </Row>
              {baseline ? (
                <Row style={{ justifyContent: 'space-between' }}>
                  <Muted>Vs. baseline</Muted>
                  <Body color={checkin.baselineShift >= 0 ? colors.moss : colors.coral} style={{ fontFamily: font.sansSemibold }}>{checkin.baselineShift >= 0 ? '+' : ''}{checkin.baselineShift}</Body>
                </Row>
              ) : null}
            </GlassCard>

            <GlassCard accent={getEmotion(checkin.emotion).color} style={{ marginTop: spacing.lg, gap: 8 }}>
              <Label color={getEmotion(checkin.emotion).color}>ONE WISE NEXT STEP</Label>
              <Serif style={{ fontSize: 20 }}>{nextStep?.practice ?? checkin.recommendation.practice}</Serif>
              <Body>{nextStep?.rationale ?? checkin.recommendation.reason}</Body>
              {nextStep ? <Muted>{nextStep.durationMinutes} minute practice · {nextStep.category}</Muted> : null}
            </GlassCard>

            {nextStep ? (
              <>
                <GlassCard accent={colors.lavender} style={{ marginTop: spacing.md, gap: 8 }}>
                  <Label color={colors.lavender}>WISDOM</Label>
                  <Serif style={{ fontSize: 19 }}>{nextStep.wisdom.title}</Serif>
                  <Body>{nextStep.wisdom.body}</Body>
                  <Muted>{nextStep.wisdom.action}</Muted>
                </GlassCard>
                <GlassCard accent={colors.moss} style={{ marginTop: spacing.md, gap: 8 }}>
                  <Label color={colors.moss}>PURPOSE THROUGH CARE</Label>
                  <Serif style={{ fontSize: 19 }}>{nextStep.purpose.title}</Serif>
                  <Body>{nextStep.purpose.body}</Body>
                  <Muted>{nextStep.purpose.action}</Muted>
                </GlassCard>
              </>
            ) : null}

            {quest ? (
              <GlassCard accent={colors.amber} style={{ marginTop: spacing.md, gap: 8 }}>
                <Label color={colors.amber}>MATCHED INNER PATH QUEST</Label>
                <Serif style={{ fontSize: 19 }}>{quest.quest.title}</Serif>
                <Body>{quest.quest.instruction}</Body>
                <Muted>{quest.reason} · +{quest.quest.resonance} resonance</Muted>
                <GradientButton label="Open quest" variant="ghost" onPress={() => router.push(`/side/quest/${quest.quest.id}` as any)} full />
              </GlassCard>
            ) : null}

            <View style={{ height: spacing.xl }} />
            <GradientButton label={`Begin ${nextStep?.practice ?? checkin.recommendation.practice}`} onPress={() => { tap(); router.replace((nextStep?.route ?? checkin.recommendation.route) as any); }} full />
            <View style={{ height: spacing.md }} />
            <GradientButton label="Back to today" variant="ghost" onPress={() => router.replace('/(tabs)')} full />
            <View style={{ height: 40 }} />
          </Animated.ScrollView>
        )}

        {(step === 'ready' || step === 'recording') && (
          <View style={styles.footer}>
            {step === 'ready' ? (
              <>
                <GradientButton label="Start speaking" onPress={begin} full />
                {sampleError ? <GradientButton label="Continue without voice" variant="ghost" onPress={() => router.replace('/feel')} full /> : null}
              </>
            ) : (
              <>
                <GradientButton label={recorder.status === 'denied' ? 'Continue without voice' : 'Finish and check sample'} onPress={recorder.status === 'denied' ? () => router.replace('/feel') : finish} disabled={recorder.status !== 'denied' && recorder.durationMs < MIN_MS} full />
              </>
            )}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  iconBtn: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 24, alignItems: 'stretch' },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  dot: { width: 12, height: 12, borderRadius: 6 },
  secRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8 },
  secChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, backgroundColor: colors.surface1 },
  secDot: { width: 8, height: 8, borderRadius: 4 },
});
