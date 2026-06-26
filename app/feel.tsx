import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { ModalHeader } from '../src/components/ModalHeader';
import { EmotionWheel } from '../src/components/EmotionWheel';
import { FactorPicker } from '../src/components/FactorPicker';
import { GradientButton } from '../src/components/GradientButton';
import { Serif, Muted, Label, Body, GlassCard } from '../src/components/ui';
import { useApp } from '../src/context/AppContext';
import { useSide } from '../src/side/SideContext';
import { buildSelfCheckIn, type CheckIn } from '../src/lib/voice';
import { recommendationFromCheckIn } from '../src/lib/recommendationEngine';
import { matchSideQuest } from '../src/lib/sideQuestMatcher';
import { getEmotion } from '../src/lib/emotions';
import { colors, spacing } from '../src/theme/theme';
import { success, tap } from '../src/lib/haptics';

function sessionRoute(kind: string): string {
  return kind === 'breath' ? '/breath' : kind === 'stillness' ? '/stillness' : kind === 'meta' ? '/meta' : '/sound';
}

export default function Feel() {
  const router = useRouter();
  const { addCheckIn, baseline, sessions } = useApp();
  const side = useSide();
  const [emotion, setEmotion] = useState('calm');
  const [factors, setFactors] = useState<string[]>([]);
  const [checkin, setCheckin] = useState<CheckIn | null>(null);

  const recommendation = useMemo(() => {
    if (!checkin) return null;
    return recommendationFromCheckIn(checkin, {
      baseline,
      recentPracticeRoutes: sessions.slice(0, 6).map((session) => sessionRoute(session.kind)),
    });
  }, [baseline, checkin, sessions]);

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

  const log = () => {
    const next = buildSelfCheckIn(emotion, undefined, factors);
    addCheckIn(next);
    setCheckin(next);
    success();
  };

  const accent = getEmotion(checkin?.emotion ?? emotion).color;

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={accent} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ModalHeader title={checkin ? 'Your next step' : 'How do you feel?'} accent={accent} />

        {!checkin ? (
          <>
            <Animated.ScrollView entering={FadeIn} showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
              <Serif center style={{ fontSize: 22, marginBottom: 4 }}>Name the feeling</Serif>
              <Muted center style={{ marginBottom: spacing.lg, maxWidth: 300, alignSelf: 'center' }}>
                Naming what you feel — even roughly — is a small act of clarity.
              </Muted>
              <EmotionWheel value={emotion} onChange={setEmotion} size={300} />
              <Label style={{ marginTop: spacing.xl, marginBottom: 10 }}>WHAT’S SHAPING THIS? (OPTIONAL)</Label>
              <FactorPicker value={factors} onChange={setFactors} accent={accent} />
            </Animated.ScrollView>
            <View style={styles.footer}>
              <GradientButton label="Continue" onPress={log} full />
            </View>
          </>
        ) : (
          <Animated.ScrollView entering={FadeInDown.duration(450)} showsVerticalScrollIndicator={false} contentContainerStyle={styles.result}>
            <Label center color={accent}>YOU NAMED THIS AS</Label>
            <Serif center style={{ fontSize: 30, marginTop: 6 }}>{getEmotion(checkin.emotion).label}</Serif>
            <Muted center style={{ marginBottom: spacing.lg }}>{getEmotion(checkin.emotion).blurb}</Muted>

            {recommendation ? (
              <>
                <GlassCard accent={accent} style={styles.card}>
                  <Label color={accent}>ONE WISE NEXT STEP</Label>
                  <Serif style={{ fontSize: 20 }}>{recommendation.practice}</Serif>
                  <Body>{recommendation.rationale}</Body>
                  <Muted>{recommendation.durationMinutes} minute practice</Muted>
                </GlassCard>

                <GlassCard accent={colors.lavender} style={styles.card}>
                  <Label color={colors.lavender}>WISDOM</Label>
                  <Serif style={{ fontSize: 19 }}>{recommendation.wisdom.title}</Serif>
                  <Body>{recommendation.wisdom.body}</Body>
                  <Muted>{recommendation.wisdom.action}</Muted>
                </GlassCard>

                <GlassCard accent={colors.moss} style={styles.card}>
                  <Label color={colors.moss}>PURPOSE THROUGH CARE</Label>
                  <Serif style={{ fontSize: 19 }}>{recommendation.purpose.title}</Serif>
                  <Body>{recommendation.purpose.action}</Body>
                </GlassCard>

                <GradientButton label={`Begin ${recommendation.practice}`} onPress={() => { tap(); router.replace(recommendation.route as any); }} full />
              </>
            ) : null}

            {quest ? (
              <GlassCard accent={colors.amber} style={styles.card}>
                <Label color={colors.amber}>MATCHED INNER PATH QUEST</Label>
                <Serif style={{ fontSize: 19 }}>{quest.quest.title}</Serif>
                <Body>{quest.quest.instruction}</Body>
                <Muted>{quest.reason} · +{quest.quest.resonance} resonance</Muted>
                <GradientButton label="Open quest" variant="ghost" onPress={() => router.push(`/side/quest/${quest.quest.id}` as any)} full />
              </GlassCard>
            ) : null}

            <GradientButton label="Back to today" variant="ghost" onPress={() => router.replace('/(tabs)')} full />
          </Animated.ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 30 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.md },
  result: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 50, gap: spacing.md },
  card: { gap: 8 },
});
