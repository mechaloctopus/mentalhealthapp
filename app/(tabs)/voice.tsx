import React from 'react';
import { View, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, Display, Body, Muted, Label, GlassCard, Serif, Row } from '../../src/components/ui';
import { GradientButton } from '../../src/components/GradientButton';
import { SignalBar } from '../../src/components/SignalBar';
import { Sparkline } from '../../src/components/Sparkline';
import { useApp } from '../../src/context/AppContext';
import { useSide } from '../../src/side/SideContext';
import { MISSION, missionStageFor } from '../../src/side/content';
import { TREES, treeLevel } from '../../src/side/trees';
import { getEmotion } from '../../src/lib/emotions';
import { computeStreak, emotionDistribution, factorImpact, summarize } from '../../src/lib/insights';
import { factorLabel } from '../../src/lib/factors';
import { colors, font, spacing, radius } from '../../src/theme/theme';

export default function Voice() {
  const router = useRouter();
  const { checkins, baseline, sessions, journal } = useApp();
  const side = useSide();
  const { width } = useWindowDimensions();
  const recent = checkins.slice(0, 14).reverse();
  const calmSeries = recent.map((checkin) => checkin.calmness);
  const summary = summarize(checkins, [...sessions.map((session) => session.at), ...journal.map((entry) => entry.at)]);
  const rhythm = computeStreak([...checkins.map((checkin) => checkin.at), ...sessions.map((session) => session.at), ...journal.map((entry) => entry.at)]);
  const distribution = emotionDistribution(checkins).slice(0, 5);
  const impact = factorImpact(checkins);
  const lifts = impact.filter((factor) => factor.delta > 0.05).slice(0, 3);
  const weighs = impact.filter((factor) => factor.delta < -0.05).reverse().slice(0, 3);
  const { stage, next } = missionStageFor(side.resonance);
  const intoStage = side.resonance - stage.threshold;
  const stageSpan = next ? next.threshold - stage.threshold : 1;
  const stageProgress = next ? Math.min(100, Math.round((intoStage / stageSpan) * 100)) : 100;
  const stageIndex = MISSION.findIndex((item) => item.id === stage.id);
  const treeProgress = TREES.map((tree) => ({ tree, ...treeLevel(side.treeXp[tree.id] ?? 0) }));
  const activeTrees = treeProgress.filter((item) => item.level > 0).length;

  return (
    <Screen tint={colors.blue}>
      <View style={styles.header}>
        <Display style={{ fontSize: 32 }}>Insights</Display>
        <Muted style={{ marginTop: 4 }}>Your patterns and growth, gently observed.</Muted>
      </View>

      <Animated.View entering={FadeInDown.duration(500)}>
        <Pressable onPress={() => router.push('/side')} accessibilityRole="button" accessibilityLabel={`Open the Inner Path. ${side.resonance} resonance. Stage ${stageIndex + 1}, ${stage.title}.`}>
          <GlassCard style={{ gap: spacing.md }} accent={stage.color}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Label color={stage.color}>INNER PATH</Label>
                <Display style={{ fontSize: 36, marginTop: 2 }}>{side.resonance}</Display>
                <Muted>resonance</Muted>
              </View>
              <View style={[styles.stageIcon, { backgroundColor: stage.color + '1a', borderColor: stage.color + '55' }]}>
                <Ionicons name={stage.icon} size={24} color={stage.color} />
              </View>
            </Row>
            <View style={{ gap: 7 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Body color={colors.text} style={{ fontFamily: font.sansSemibold }}>Stage {stageIndex + 1} · {stage.title}</Body>
                <Muted style={{ fontSize: 12 }}>{next ? `${next.threshold - side.resonance} to next` : 'Highest stage'}</Muted>
              </Row>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${stageProgress}%`, backgroundColor: stage.color }]} />
              </View>
              <Muted style={{ fontSize: 12.5 }}>{activeTrees} skill trees active · {rhythm}-day activity rhythm</Muted>
            </View>
          </GlassCard>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(500)} style={{ marginTop: spacing.md }}>
        <GlassCard accent={colors.teal} style={{ gap: spacing.md, alignItems: 'center' }}>
          <View style={styles.micHalo}>
            <Ionicons name="mic" size={30} color={colors.teal} />
          </View>
          <Serif center style={{ fontSize: 22 }}>30–60 second check-in</Serif>
          <Body center style={{ maxWidth: 300 }}>
            Speak freely. MoodSignal estimates a signal on-device, you confirm it, and the app recommends one next step.
          </Body>
          <GradientButton label="Start check-in" onPress={() => router.push('/checkin')} full />
          <GradientButton label="Name how I feel without voice" variant="ghost" onPress={() => router.push('/feel')} full />
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(500)} style={{ marginTop: spacing.xl }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <Label>SKILL TREES</Label>
          <Pressable onPress={() => router.push('/side/trees')} accessibilityRole="button" accessibilityLabel="Open all skill trees">
            <Muted style={{ color: colors.lavender }}>Open full trees →</Muted>
          </Pressable>
        </Row>
        <View style={styles.badgeWrap}>
          {treeProgress.map(({ tree, level }) => {
            const earned = level > 0;
            return (
              <View key={tree.id} style={[styles.badge, earned ? { borderColor: tree.color + '77' } : { opacity: 0.45 }]} accessibilityLabel={`${tree.label}, level ${level}`}>
                <Ionicons name={tree.icon} size={18} color={earned ? tree.color : colors.textDim} />
                <Muted style={{ fontSize: 10.5, textAlign: 'center', color: earned ? colors.textMuted : colors.textFaint }}>{tree.label}</Muted>
                <Body color={earned ? tree.color : colors.textDim} style={{ fontFamily: font.sansBold, fontSize: 11 }}>Lv {level}</Body>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {distribution.length > 0 && (
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={{ marginTop: spacing.xl }}>
          <Label style={{ marginBottom: 12 }}>YOUR EMOTIONS · {summary.total} CHECK-INS</Label>
          <GlassCard style={{ gap: spacing.md }}>
            {distribution.map((item) => (
              <View key={item.id} style={{ gap: 6 }}>
                <View style={styles.distHead}>
                  <Row gap={8}>
                    <View style={[styles.histEmoDot, { backgroundColor: item.color }]} />
                    <Body color={colors.text} style={{ fontFamily: font.sansMedium, fontSize: 14 }}>{item.label}</Body>
                  </Row>
                  <Muted style={{ fontSize: 12 }}>{Math.round(item.pct * 100)}%</Muted>
                </View>
                <View style={styles.distTrack}>
                  <View style={[styles.distFill, { width: `${Math.round(item.pct * 100)}%`, backgroundColor: item.color }]} />
                </View>
              </View>
            ))}
          </GlassCard>
        </Animated.View>
      )}

      {(lifts.length > 0 || weighs.length > 0) && (
        <Animated.View entering={FadeInDown.delay(140).duration(500)} style={{ marginTop: spacing.xl }}>
          <Label style={{ marginBottom: 12 }}>WHAT MOVES YOUR MOOD</Label>
          <GlassCard style={{ gap: spacing.md }}>
            {lifts.length > 0 && (
              <View style={{ gap: 8 }}>
                <Muted style={{ color: colors.moss }}>Associated with better check-ins</Muted>
                <Row style={{ flexWrap: 'wrap', gap: 8 }}>
                  {lifts.map((factor) => (
                    <View key={factor.id} style={[styles.factorChip, { borderColor: colors.moss + '55' }]}>
                      <Ionicons name="arrow-up" size={12} color={colors.moss} />
                      <Body color={colors.text} style={{ fontSize: 12.5 }}>{factorLabel(factor.id)}</Body>
                    </View>
                  ))}
                </Row>
              </View>
            )}
            {weighs.length > 0 && (
              <View style={{ gap: 8 }}>
                <Muted style={{ color: colors.coral }}>Associated with harder check-ins</Muted>
                <Row style={{ flexWrap: 'wrap', gap: 8 }}>
                  {weighs.map((factor) => (
                    <View key={factor.id} style={[styles.factorChip, { borderColor: colors.coral + '55' }]}>
                      <Ionicons name="arrow-down" size={12} color={colors.coral} />
                      <Body color={colors.text} style={{ fontSize: 12.5 }}>{factorLabel(factor.id)}</Body>
                    </View>
                  ))}
                </Row>
              </View>
            )}
            <Muted style={{ fontSize: 11.5 }}>Patterns from your tagged check-ins are associations, not proof of cause.</Muted>
          </GlassCard>
        </Animated.View>
      )}

      {baseline && (
        <Animated.View entering={FadeInDown.delay(160).duration(500)} style={{ marginTop: spacing.xl }}>
          <Label style={{ marginBottom: 12 }}>YOUR VOICE BASELINE</Label>
          <GlassCard style={{ gap: spacing.lg }}>
            <SignalBar label="Energy" value={baseline.energy} color={colors.amber} />
            <SignalBar label="Calmness" value={baseline.calmness} color={colors.teal} delay={120} />
            <SignalBar label="Stability" value={baseline.stability} color={colors.blue} delay={240} />
          </GlassCard>
        </Animated.View>
      )}

      {calmSeries.length >= 2 && (
        <Animated.View entering={FadeInDown.delay(180).duration(500)} style={{ marginTop: spacing.xl }}>
          <Label style={{ marginBottom: 12 }}>CALMNESS TREND</Label>
          <GlassCard>
            <Sparkline values={calmSeries} width={width - spacing.lg * 4} color={colors.teal} />
            <Muted style={{ marginTop: 8 }}>Last {calmSeries.length} check-ins</Muted>
          </GlassCard>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ marginTop: spacing.xl }}>
        <Label style={{ marginBottom: 12 }}>HISTORY</Label>
        {checkins.length === 0 ? (
          <GlassCard>
            <Body center color={colors.textDim}>No check-ins yet. Your history will appear here.</Body>
          </GlassCard>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {checkins.slice(0, 20).map((checkin) => (
              <GlassCard key={checkin.id} style={styles.histRow}>
                <View style={[styles.histEmoDot, { backgroundColor: getEmotion(checkin.emotion).color }]} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Row gap={6}>
                    <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 15 }}>{getEmotion(checkin.emotion).label}</Body>
                    <Ionicons name={checkin.source === 'self' ? 'hand-left' : 'mic'} size={11} color={colors.textDim} />
                  </Row>
                  <Muted style={{ fontSize: 12.5 }}>
                    {new Date(checkin.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {new Date(checkin.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                  </Muted>
                </View>
                <Row gap={spacing.md}>
                  <Stat label="E" value={checkin.energy} color={colors.amber} />
                  <Stat label="C" value={checkin.calmness} color={colors.teal} />
                </Row>
              </GlassCard>
            ))}
          </View>
        )}
      </Animated.View>

      <Muted center style={styles.disclaimer}>
        MoodSignal supports wellness and self-reflection. It does not diagnose, treat, or provide medical advice.
      </Muted>
    </Screen>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Body style={{ fontFamily: font.sansBold, fontSize: 15, color }}>{value}</Body>
      <Muted style={{ fontSize: 10 }}>{label}</Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xs, marginBottom: spacing.lg },
  stageIcon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  micHalo: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.teal + '1a', borderWidth: 1, borderColor: colors.teal + '55' },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  histEmoDot: { width: 12, height: 12, borderRadius: 6 },
  disclaimer: { marginTop: spacing.xl, fontSize: 12, lineHeight: 18 },
  progressTrack: { height: 7, borderRadius: 6, backgroundColor: colors.surface3, overflow: 'hidden' },
  progressFill: { height: 7, borderRadius: 6 },
  distHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  distTrack: { height: 7, borderRadius: 6, backgroundColor: colors.hairline, overflow: 'hidden' },
  distFill: { height: 7, borderRadius: 6 },
  factorChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, backgroundColor: colors.surface1 },
  badgeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badge: { width: '22.5%', aspectRatio: 0.88, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: radius.md, borderWidth: 1, borderColor: colors.panelBorder, backgroundColor: colors.surface1, paddingHorizontal: 4 },
});
