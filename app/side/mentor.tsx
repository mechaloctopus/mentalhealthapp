import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../../src/components/AnimatedBackground';
import { ModalHeader } from '../../src/components/ModalHeader';
import { Display, Body, Muted, Label, GlassCard, Serif, Row, Title } from '../../src/components/ui';
import { useApp } from '../../src/context/AppContext';
import { useSide } from '../../src/side/SideContext';
import { getQuest } from '../../src/side/content';
import { TREES, treeLevel } from '../../src/side/trees';
import { mentorNudge } from '../../src/side/mentor';
import { computeStreak, emotionDistribution } from '../../src/lib/insights';
import { getEmotion } from '../../src/lib/emotions';
import { colors, font, spacing } from '../../src/theme/theme';
import { tap } from '../../src/lib/haptics';

export default function Mentor() {
  const router = useRouter();
  const core = useApp();
  const side = useSide();
  const name = (core.user?.name ?? 'friend').split(' ')[0];
  const accent = colors.lavender;
  const weekAgo = Date.now() - 7 * 86400000;

  const lastEmotion = core.checkins[0]?.emotion;
  const streak = computeStreak([...core.checkins.map((c) => c.at), ...core.sessions.map((s) => s.at), ...core.journal.map((j) => j.at)]);
  const weekCheckins = core.checkins.filter((c) => c.at >= weekAgo).length;
  const questsThisWeek = Object.values(side.completions).reduce((a, ts) => a + ts.filter((t) => t >= weekAgo).length, 0);
  const topEmotion = emotionDistribution(core.checkins)[0];

  const nudge = mentorNudge({
    name, lastEmotion,
    daysSinceCheckin: core.checkins[0] ? Math.floor((Date.now() - core.checkins[0].at) / 86400000) : 99,
    coreStreak: streak, resonance: side.resonance,
    doneToday: side.daily.done.length, totalToday: side.daily.questIds.length,
    karma: side.karma, stewardship: side.stewardship,
  });

  // Adaptive recommendation: first undone quest today, gentler ones first if mood is low.
  const undone = side.daily.questIds.map(getQuest).filter((q): q is NonNullable<typeof q> => !!q)
    .filter((q) => (q.repeatable ? !side.isDoneToday(q.id) : !side.isCompleted(q.id)));
  const lowMood = lastEmotion ? getEmotion(lastEmotion).valence < -0.2 : false;
  const gentleKinds = ['breath', 'meditate', 'gratitude', 'reflect'];
  const recommended = lowMood
    ? (undone.find((q) => gentleKinds.includes(q.kind)) ?? undone[0])
    : undone[0];

  // Personalized meditation from the last emotion.
  const med = lastEmotion ? getEmotion(lastEmotion).practice : { label: 'Breath reset', route: '/breath' };

  // Coaching observations.
  const lastJournal = core.journal[0]?.at;
  const journalDays = lastJournal ? Math.floor((Date.now() - lastJournal) / 86400000) : 99;
  const topTree = [...TREES].map((t) => ({ t, xp: side.treeXp[t.id] ?? 0 })).sort((a, b) => b.xp - a.xp)[0];
  const coaching: string[] = [];
  if (streak >= 3) coaching.push(`You're on a ${streak}-day streak — momentum is real. Keep each day small and doable.`);
  if (journalDays >= 3) coaching.push(`It's been a while since you wrote. A few honest sentences can clear a lot.`);
  if (topTree && topTree.xp > 0) coaching.push(`Your ${topTree.t.label} tree is growing fastest (Lv ${treeLevel(topTree.xp).level}). It's becoming a strength.`);
  if (topEmotion && getEmotion(topEmotion.id).valence < -0.2) coaching.push(`${getEmotion(topEmotion.id).label} has been frequent lately. Be extra gentle with yourself this week.`);
  if (coaching.length === 0) coaching.push(`You're building a steady practice. Trust the small reps — they compound.`);

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={accent} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ModalHeader title="Your mentor" accent={accent} />
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}>
          <Row gap={12} style={{ marginBottom: spacing.md }}>
            <View style={[styles.orb, { borderColor: accent + '55', backgroundColor: accent + '18' }]}>
              <Ionicons name="sparkles" size={24} color={accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Display style={{ fontSize: 24 }}>Mentor</Display>
              <Muted style={{ fontSize: 12.5 }}>Remembers your mood, habits & progress</Muted>
            </View>
          </Row>

          <Animated.View entering={FadeInDown.duration(500)}>
            <GlassCard accent={accent}>
              <Serif style={{ fontSize: 18, lineHeight: 27 }}>{nudge.line}</Serif>
            </GlassCard>
          </Animated.View>

          {/* This week */}
          <Animated.View entering={FadeInDown.delay(60).duration(500)} style={{ marginTop: spacing.xl }}>
            <Label style={{ marginBottom: 12 }}>THIS WEEK</Label>
            <GlassCard>
              <Row style={{ justifyContent: 'space-around' }}>
                <Stat value={weekCheckins} label="Check-ins" color={colors.teal} />
                <View style={styles.vline} />
                <Stat value={questsThisWeek} label="Quests" color={colors.gold} />
                <View style={styles.vline} />
                <Stat value={streak} label="Day streak" color={colors.coral} />
              </Row>
              {topEmotion ? (
                <Row gap={8} style={{ marginTop: spacing.md, justifyContent: 'center' }}>
                  <View style={[styles.dot, { backgroundColor: getEmotion(topEmotion.id).color }]} />
                  <Muted style={{ fontSize: 12.5 }}>Most-felt: {getEmotion(topEmotion.id).label}</Muted>
                </Row>
              ) : null}
            </GlassCard>
          </Animated.View>

          {/* Recommended next */}
          <Animated.View entering={FadeInDown.delay(120).duration(500)} style={{ marginTop: spacing.xl }}>
            <Label style={{ marginBottom: 12 }}>RECOMMENDED FOR YOU</Label>
            {recommended ? (
              <Pressable onPress={() => { tap(); router.push(`/side/quest/${recommended.id}`); }}>
                <GlassCard accent={colors.gold} style={{ gap: 6 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Label color={colors.gold}>{lowMood ? 'A GENTLE QUEST' : 'TODAY’S QUEST'}</Label>
                    <Muted style={{ fontSize: 12 }}>+{recommended.resonance}</Muted>
                  </Row>
                  <Serif style={{ fontSize: 19 }}>{recommended.title}</Serif>
                  <Body style={{ fontSize: 13.5 }} numberOfLines={2}>{recommended.instruction}</Body>
                </GlassCard>
              </Pressable>
            ) : (
              <Pressable onPress={() => { tap(); router.push('/checkin'); }}>
                <GlassCard accent={colors.teal}>
                  <Serif style={{ fontSize: 18 }}>Start with a check-in</Serif>
                  <Body style={{ fontSize: 13.5, marginTop: 4 }}>A 60-second check-in lets me tailor today’s path to how you actually feel.</Body>
                </GlassCard>
              </Pressable>
            )}
          </Animated.View>

          {/* Meditation pick */}
          <Animated.View entering={FadeInDown.delay(180).duration(500)} style={{ marginTop: spacing.xl }}>
            <Label style={{ marginBottom: 12 }}>A PRACTICE THAT FITS</Label>
            <Pressable onPress={() => { tap(); router.push(med.route as any); }}>
              <GlassCard accent={colors.lavender} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.medIcon, { backgroundColor: colors.lavender + '1f' }]}>
                  <Ionicons name="flower" size={20} color={colors.lavender} />
                </View>
                <View style={{ flex: 1 }}>
                  <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 15 }}>{med.label}</Body>
                  <Muted style={{ fontSize: 12.5 }}>{lastEmotion ? `Chosen for feeling ${getEmotion(lastEmotion).label.toLowerCase()}` : 'A gentle place to begin'}</Muted>
                </View>
                <Ionicons name="arrow-forward" size={18} color={colors.lavender} />
              </GlassCard>
            </Pressable>
          </Animated.View>

          {/* Coaching */}
          <Animated.View entering={FadeInDown.delay(240).duration(500)} style={{ marginTop: spacing.xl }}>
            <Label style={{ marginBottom: 12 }}>WHAT I'M NOTICING</Label>
            <View style={{ gap: spacing.sm }}>
              {coaching.map((c, i) => (
                <GlassCard key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                  <Ionicons name="ellipse" size={8} color={accent} style={{ marginTop: 7 }} />
                  <Body style={{ flex: 1, fontSize: 14, lineHeight: 21 }}>{c}</Body>
                </GlassCard>
              ))}
            </View>
          </Animated.View>

          <Muted center style={{ marginTop: spacing.xl, fontSize: 11.5, lineHeight: 17 }}>
            Your mentor reasons on-device from your own data. A deeper, conversational mentor (with memory) connects via a secure service in a future update.
          </Muted>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Title style={{ fontFamily: font.serif, fontSize: 26, color }}>{value}</Title>
      <Muted style={{ fontSize: 11.5 }}>{label}</Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  vline: { width: 1, height: 34, backgroundColor: colors.panelBorder },
  dot: { width: 10, height: 10, borderRadius: 5 },
  medIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
