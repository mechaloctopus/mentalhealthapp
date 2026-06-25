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
import { getEmotion } from '../../src/lib/emotions';
import { emotionDistribution, factorImpact, summarize } from '../../src/lib/insights';
import { computeProgress, computeBadges } from '../../src/lib/progress';
import { factorLabel } from '../../src/lib/factors';
import { Companion } from '../../src/components/Companion';
import { colors, font, spacing, radius } from '../../src/theme/theme';

export default function Voice() {
  const router = useRouter();
  const { checkins, baseline, sessions, journal } = useApp();
  const { width } = useWindowDimensions();
  const recent = checkins.slice(0, 14).reverse();
  const calmSeries = recent.map((c) => c.calmness);

  const progress = computeProgress({ checkins, sessions, journal });
  const summary = summarize(checkins, [...sessions.map((s) => s.at), ...journal.map((j) => j.at)]);
  const dist = emotionDistribution(checkins).slice(0, 5);
  const badges = computeBadges({ checkins, sessions, journal, streak: progress.streak });
  const impact = factorImpact(checkins);
  const lifts = impact.filter((f) => f.delta > 0.05).slice(0, 3);
  const weighs = impact.filter((f) => f.delta < -0.05).reverse().slice(0, 3);

  return (
    <Screen tint={colors.blue}>
      <View style={styles.header}>
        <Display style={{ fontSize: 32 }}>Insights</Display>
        <Muted style={{ marginTop: 4 }}>Your patterns, gently observed.</Muted>
      </View>

      {/* Companion + streak */}
      <Animated.View entering={FadeInDown.duration(500)}>
        <Pressable onPress={() => router.push('/checkin')}>
          <GlassCard style={styles.lumenCard} accent={colors.teal}>
            <Companion progress={progress} size={84} />
            <View style={{ flex: 1, gap: 3 }}>
              <Serif style={{ fontSize: 20 }}>Lumen · {progress.levelName}</Serif>
              <Muted style={{ fontSize: 12.5 }}>{progress.streak}-day streak · {progress.toNext} pts to level {Math.min(7, progress.level + 1)}</Muted>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round((progress.intoLevel / progress.levelSpan) * 100)}%` }]} />
              </View>
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
            Speak freely. We read your emotion across 12 feelings on-device, you confirm it, then we suggest one practice.
          </Body>
          <GradientButton label="Start check-in" onPress={() => router.push('/checkin')} full />
          <GradientButton label="Just name how you feel" variant="ghost" onPress={() => router.push('/feel')} full />
        </GlassCard>
      </Animated.View>

      {/* Badges */}
      <Animated.View entering={FadeInDown.delay(80).duration(500)} style={{ marginTop: spacing.xl }}>
        <Label style={{ marginBottom: 12 }}>MILESTONES</Label>
        <View style={styles.badgeWrap}>
          {badges.map((b) => (
            <View key={b.id} style={[styles.badge, b.earned ? { borderColor: colors.amber + '66' } : { opacity: 0.4 }]}>
              <Ionicons name={(b.icon + (b.earned ? '' : '-outline')) as any} size={18} color={b.earned ? colors.amber : colors.textDim} />
              <Muted style={{ fontSize: 10.5, textAlign: 'center', color: b.earned ? colors.textMuted : colors.textFaint }}>{b.label}</Muted>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Emotion distribution */}
      {dist.length > 0 && (
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={{ marginTop: spacing.xl }}>
          <Label style={{ marginBottom: 12 }}>YOUR EMOTIONS · {summary.total} CHECK-INS</Label>
          <GlassCard style={{ gap: spacing.md }}>
            {dist.map((d) => (
              <View key={d.id} style={{ gap: 6 }}>
                <View style={styles.distHead}>
                  <Row gap={8}>
                    <View style={[styles.histEmoDot, { backgroundColor: d.color }]} />
                    <Body color={colors.text} style={{ fontFamily: font.sansMedium, fontSize: 14 }}>{d.label}</Body>
                  </Row>
                  <Muted style={{ fontSize: 12 }}>{Math.round(d.pct * 100)}%</Muted>
                </View>
                <View style={styles.distTrack}>
                  <View style={[styles.distFill, { width: `${Math.round(d.pct * 100)}%`, backgroundColor: d.color }]} />
                </View>
              </View>
            ))}
          </GlassCard>
        </Animated.View>
      )}

      {/* Factor correlations */}
      {(lifts.length > 0 || weighs.length > 0) && (
        <Animated.View entering={FadeInDown.delay(140).duration(500)} style={{ marginTop: spacing.xl }}>
          <Label style={{ marginBottom: 12 }}>WHAT MOVES YOUR MOOD</Label>
          <GlassCard style={{ gap: spacing.md }}>
            {lifts.length > 0 && (
              <View style={{ gap: 8 }}>
                <Muted style={{ color: colors.moss }}>Lifts you up</Muted>
                <Row style={{ flexWrap: 'wrap', gap: 8 }}>
                  {lifts.map((f) => (
                    <View key={f.id} style={[styles.factorChip, { borderColor: colors.moss + '55' }]}>
                      <Ionicons name="arrow-up" size={12} color={colors.moss} />
                      <Body color={colors.text} style={{ fontSize: 12.5 }}>{factorLabel(f.id)}</Body>
                    </View>
                  ))}
                </Row>
              </View>
            )}
            {weighs.length > 0 && (
              <View style={{ gap: 8 }}>
                <Muted style={{ color: colors.coral }}>Weighs on you</Muted>
                <Row style={{ flexWrap: 'wrap', gap: 8 }}>
                  {weighs.map((f) => (
                    <View key={f.id} style={[styles.factorChip, { borderColor: colors.coral + '55' }]}>
                      <Ionicons name="arrow-down" size={12} color={colors.coral} />
                      <Body color={colors.text} style={{ fontSize: 12.5 }}>{factorLabel(f.id)}</Body>
                    </View>
                  ))}
                </Row>
              </View>
            )}
            <Muted style={{ fontSize: 11.5 }}>Patterns from your tagged check-ins — a gentle signal, not a rule.</Muted>
          </GlassCard>
        </Animated.View>
      )}

      {baseline && (
        <Animated.View entering={FadeInDown.delay(80).duration(500)} style={{ marginTop: spacing.xl }}>
          <Label style={{ marginBottom: 12 }}>YOUR BASELINE</Label>
          <GlassCard style={{ gap: spacing.lg }}>
            <SignalBar label="Energy" value={baseline.energy} color={colors.amber} />
            <SignalBar label="Calmness" value={baseline.calmness} color={colors.teal} delay={120} />
            <SignalBar label="Stability" value={baseline.stability} color={colors.blue} delay={240} />
          </GlassCard>
        </Animated.View>
      )}

      {calmSeries.length >= 2 && (
        <Animated.View entering={FadeInDown.delay(140).duration(500)} style={{ marginTop: spacing.xl }}>
          <Label style={{ marginBottom: 12 }}>CALMNESS TREND</Label>
          <GlassCard>
            <Sparkline values={calmSeries} width={width - spacing.lg * 2 - spacing.lg * 2} color={colors.teal} />
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
            {checkins.slice(0, 20).map((c) => (
              <GlassCard key={c.id} style={styles.histRow}>
                <View style={[styles.histEmoDot, { backgroundColor: getEmotion(c.emotion).color }]} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Row gap={6}>
                    <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 15 }}>{getEmotion(c.emotion).label}</Body>
                    {c.source === 'self' ? <Ionicons name="hand-left" size={11} color={colors.textDim} /> : <Ionicons name="mic" size={11} color={colors.textDim} />}
                  </Row>
                  <Muted style={{ fontSize: 12.5 }}>
                    {new Date(c.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {new Date(c.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                  </Muted>
                </View>
                <Row gap={spacing.md}>
                  <Stat label="E" value={c.energy} color={colors.amber} />
                  <Stat label="C" value={c.calmness} color={colors.teal} />
                </Row>
              </GlassCard>
            ))}
          </View>
        )}
      </Animated.View>

      <Muted center style={styles.disclaimer}>
        MoodSignal is a wellness and self-reflection aid. It does not diagnose, treat, or provide medical advice. If you are in crisis, please contact local emergency services or a crisis line.
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
  micHalo: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.teal + '1a', borderWidth: 1, borderColor: colors.teal + '55' },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  histEmoDot: { width: 12, height: 12, borderRadius: 6 },
  disclaimer: { marginTop: spacing.xl, fontSize: 12, lineHeight: 18 },
  lumenCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  progressTrack: { height: 6, borderRadius: 6, backgroundColor: colors.surface3, overflow: 'hidden', marginTop: 6 },
  progressFill: { height: 6, borderRadius: 6, backgroundColor: colors.teal },
  distHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  distTrack: { height: 7, borderRadius: 6, backgroundColor: colors.hairline, overflow: 'hidden' },
  distFill: { height: 7, borderRadius: 6 },
  factorChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, backgroundColor: colors.surface1 },
  badgeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badge: { width: '22.5%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: radius.md, borderWidth: 1, borderColor: colors.panelBorder, backgroundColor: colors.surface1, paddingHorizontal: 4 },
});
