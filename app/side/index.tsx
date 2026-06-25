import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, Display, Title, Body, Muted, Label, GlassCard, Serif, Row } from '../../src/components/ui';
import { useApp } from '../../src/context/AppContext';
import { useSide } from '../../src/side/SideContext';
import { PATHS, getQuest, missionStageFor, MISSION } from '../../src/side/content';
import { TREES, treeLevel } from '../../src/side/trees';
import { mentorNudge } from '../../src/side/mentor';
import { computeStreak } from '../../src/lib/insights';
import { getEmotion } from '../../src/lib/emotions';
import { colors, font, radius, spacing } from '../../src/theme/theme';
import { tap } from '../../src/lib/haptics';

export default function SideHome() {
  const router = useRouter();
  const core = useApp();
  const side = useSide();

  const { stage, next } = missionStageFor(side.resonance);
  const stageIdx = MISSION.findIndex((m) => m.id === stage.id);
  const toNext = next ? next.threshold - stage.threshold : 1;
  const intoStage = side.resonance - stage.threshold;

  const coreStreak = computeStreak([
    ...core.checkins.map((c) => c.at),
    ...core.sessions.map((s) => s.at),
    ...core.journal.map((j) => j.at),
  ]);
  const nudge = mentorNudge({
    name: (core.user?.name ?? 'friend').split(' ')[0],
    lastEmotion: core.checkins[0]?.emotion,
    daysSinceCheckin: core.checkins[0] ? Math.floor((Date.now() - core.checkins[0].at) / 86400000) : 99,
    coreStreak,
    resonance: side.resonance,
    doneToday: side.daily.done.length,
    totalToday: side.daily.questIds.length,
    karma: side.karma,
    stewardship: side.stewardship,
  });

  const topTrees = [...TREES].sort((a, b) => (side.treeXp[b.id] ?? 0) - (side.treeXp[a.id] ?? 0)).slice(0, 4);

  return (
    <Screen tint={colors.lavender}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => { tap(); router.back(); }} hitSlop={10} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={colors.textMuted} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Label color={colors.lavender}>SIDE MODULE</Label>
          <Display style={{ fontSize: 26, marginTop: 2 }}>The Inner Path</Display>
        </View>
      </View>
      <Muted style={{ marginBottom: spacing.lg }}>
        An operating system for wisdom & flourishing. Every tradition, turned into small daily practice.
      </Muted>

      {/* Resonance + mission stage */}
      <Animated.View entering={FadeInDown.duration(500)}>
        <GlassCard accent={stage.color} style={{ gap: spacing.md }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Label color={stage.color}>RESONANCE</Label>
              <Display style={{ fontSize: 40, marginTop: 2 }}>{side.resonance}</Display>
            </View>
            <View style={[styles.stageBadge, { borderColor: stage.color + '55', backgroundColor: stage.color + '14' }]}>
              <Ionicons name={stage.icon} size={22} color={stage.color} />
            </View>
          </Row>
          <View>
            <Row style={{ justifyContent: 'space-between' }}>
              <Body color={colors.text} style={{ fontFamily: font.sansSemibold }}>Stage {stageIdx + 1} · {stage.title}</Body>
              {next ? <Muted style={{ fontSize: 12 }}>{next.threshold - side.resonance} to next</Muted> : <Muted style={{ fontSize: 12 }}>Highest stage</Muted>}
            </Row>
            <Muted style={{ fontSize: 12.5, marginTop: 2 }}>{stage.caption}</Muted>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.min(100, Math.round((intoStage / toNext) * 100))}%`, backgroundColor: stage.color }]} />
            </View>
          </View>
          <Row gap={spacing.lg}>
            <Mini label="Karma" value={side.karma} color={colors.moss} />
            <Mini label="Stewardship" value={side.stewardship} color={colors.amber} />
            <Mini label="Flow" value={side.flow} color={colors.blue} />
          </Row>
        </GlassCard>
      </Animated.View>

      {/* Mentor */}
      <Animated.View entering={FadeInDown.delay(60).duration(500)} style={{ marginTop: spacing.md }}>
        <GlassCard accent={colors.lavender} style={{ gap: 10 }}>
          <Row gap={10}>
            <View style={[styles.mentorIcon, { backgroundColor: colors.lavender + '22', borderColor: colors.lavender + '55' }]}>
              <Ionicons name="sparkles" size={16} color={colors.lavender} />
            </View>
            <Label color={colors.lavender} style={{ marginTop: 4 }}>YOUR MENTOR</Label>
          </Row>
          <Serif style={{ fontSize: 17, lineHeight: 25 }}>{nudge.line}</Serif>
          {nudge.cta ? (
            <Pressable onPress={() => { tap(); router.push(nudge.cta!.route as any); }} style={styles.mentorCta}>
              <Body color={colors.lavender} style={{ fontFamily: font.sansSemibold, fontSize: 13.5 }}>{nudge.cta.label} →</Body>
            </Pressable>
          ) : null}
        </GlassCard>
      </Animated.View>

      {/* Today's quests */}
      <Animated.View entering={FadeInDown.delay(120).duration(500)} style={{ marginTop: spacing.xl }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <Label>TODAY'S QUESTS</Label>
          <Muted style={{ fontSize: 12 }}>{side.daily.done.length}/{side.daily.questIds.length} done</Muted>
        </Row>
        <View style={{ gap: spacing.sm }}>
          {side.daily.questIds.map((qid) => {
            const q = getQuest(qid);
            if (!q) return null;
            const done = q.repeatable ? side.isDoneToday(qid) : side.isCompleted(qid);
            return (
              <Pressable key={qid} onPress={() => { tap(); router.push(`/side/quest/${qid}`); }}>
                <GlassCard style={[styles.questRow, done && { opacity: 0.6 }]}>
                  <View style={[styles.check, done ? { backgroundColor: colors.moss, borderColor: colors.moss } : { borderColor: colors.panelBorderStrong }]}>
                    {done ? <Ionicons name="checkmark" size={14} color={colors.black} /> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 14.5, textDecorationLine: done ? 'line-through' : 'none' }}>{q.title}</Body>
                    <Muted style={{ fontSize: 12 }} numberOfLines={1}>{q.tradition ?? q.kind} · +{q.resonance} resonance</Muted>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
                </GlassCard>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* Wisdom paths */}
      <Animated.View entering={FadeInDown.delay(180).duration(500)} style={{ marginTop: spacing.xl }}>
        <Label style={{ marginBottom: 4 }}>WISDOM PATHS</Label>
        <Muted style={{ fontSize: 12, marginBottom: 12 }}>Optional journeys. Explore what resonates with you.</Muted>
        <View style={styles.pathGrid}>
          {PATHS.map((p) => {
            const prog = side.pathProgress(p.id);
            const active = side.activePaths.includes(p.id);
            return (
              <Pressable key={p.id} style={{ width: '48%' }} onPress={() => { tap(); router.push(`/side/path/${p.id}`); }}>
                <GlassCard style={styles.pathCard} accent={p.color}>
                  <View style={[styles.pathIcon, { backgroundColor: p.color + '22' }]}>
                    <Ionicons name={p.icon} size={20} color={p.color} />
                  </View>
                  <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 14 }}>{p.title}</Body>
                  <Muted style={{ fontSize: 11 }} numberOfLines={1}>{p.subtitle}</Muted>
                  <Muted style={{ fontSize: 11, color: active ? p.color : colors.textDim }}>{active ? `${prog.done}/${prog.total} · active` : 'Tap to begin'}</Muted>
                </GlassCard>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* Skill trees */}
      <Animated.View entering={FadeInDown.delay(240).duration(500)} style={{ marginTop: spacing.xl }}>
        <Pressable onPress={() => { tap(); router.push('/side/trees'); }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <Label>SKILL TREES</Label>
            <Muted style={{ fontSize: 12, color: colors.lavender }}>See all 11 →</Muted>
          </Row>
        </Pressable>
        <GlassCard style={{ gap: spacing.md }}>
          {topTrees.map((t) => {
            const lv = treeLevel(side.treeXp[t.id] ?? 0);
            return (
              <View key={t.id} style={{ gap: 6 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Row gap={8}>
                    <Ionicons name={t.icon} size={15} color={t.color} />
                    <Body color={colors.text} style={{ fontFamily: font.sansMedium, fontSize: 13.5 }}>{t.label}</Body>
                  </Row>
                  <Muted style={{ fontSize: 12 }}>Lv {lv.level}</Muted>
                </Row>
                <View style={styles.treeTrack}>
                  <View style={[styles.treeFill, { width: `${Math.round((lv.into / lv.span) * 100)}%`, backgroundColor: t.color }]} />
                </View>
              </View>
            );
          })}
        </GlassCard>
      </Animated.View>

      <Muted center style={{ marginTop: spacing.xl, fontSize: 11.5, lineHeight: 17 }}>
        These practices are drawn from many traditions and offered for reflection and well-being — not as religious instruction or a substitute for professional care.
      </Muted>
    </Screen>
  );
}

function Mini({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ gap: 1 }}>
      <Title style={{ fontFamily: font.serif, fontSize: 20, color }}>{value}</Title>
      <Muted style={{ fontSize: 11 }}>{label}</Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.xs, marginBottom: 6 },
  back: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  stageBadge: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  track: { height: 7, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: 10 },
  fill: { height: 7, borderRadius: 6 },
  mentorIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  mentorCta: { paddingTop: 2 },
  questRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  pathGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md },
  pathCard: { gap: 5, padding: spacing.md, minHeight: 128 },
  pathIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  treeTrack: { height: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  treeFill: { height: 6, borderRadius: 6 },
});
