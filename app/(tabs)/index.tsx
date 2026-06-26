import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, Display, Title, Body, Muted, Label, GlassCard, Serif, Row } from '../../src/components/ui';
import { MessageCard } from '../../src/components/MessageCard';
import { GradientButton } from '../../src/components/GradientButton';
import { useApp } from '../../src/context/AppContext';
import { useSide } from '../../src/side/SideContext';
import { getQuest, missionStageFor } from '../../src/side/content';
import { TREES, treeLevel } from '../../src/side/trees';
import { todaysMessage } from '../../src/data/messages';
import { getEmotion } from '../../src/lib/emotions';
import { initials } from '../../src/lib/auth';
import { colors, font, radius, spacing } from '../../src/theme/theme';
import { tap } from '../../src/lib/haptics';

const TOOLS = [
  { title: 'Practices', sub: 'Breath, stillness, kindness, and sound', icon: 'leaf' as const, route: '/practices', color: colors.teal },
  { title: 'Guided reflection', sub: 'Work through one thought clearly', icon: 'chatbubbles' as const, route: '/coach', color: colors.lavender },
  { title: 'Journal', sub: 'Write what is true', icon: 'book' as const, route: '/journal', color: colors.amber },
  { title: 'Insights', sub: 'Patterns, resonance, and skill trees', icon: 'analytics' as const, route: '/voice', color: colors.blue },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Rest well';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Winding down';
}

export default function Today() {
  const router = useRouter();
  const { user, checkins, baseline } = useApp();
  const side = useSide();
  const last = checkins[0];
  const mission = missionStageFor(side.resonance).stage;
  const nextQuestId = side.daily.questIds.find((id) => !side.isDoneToday(id));
  const nextQuest = nextQuestId ? getQuest(nextQuestId) : undefined;
  const activeTrees = TREES.filter((tree) => treeLevel(side.treeXp[tree.id] ?? 0).level > 0).length;
  const firstName = (user?.name ?? 'Friend').split(' ')[0];

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Muted>{greeting()},</Muted>
          <Display style={{ fontSize: 30, marginTop: 2 }}>{firstName}</Display>
        </View>
        <Pressable onPress={() => router.push('/profile')} accessibilityRole="button" accessibilityLabel="Open profile">
          <View style={[styles.avatar, { backgroundColor: (user?.avatarColor ?? colors.teal) + '33', borderColor: (user?.avatarColor ?? colors.teal) + '88' }]}>
            <Title style={{ fontSize: 16, color: user?.avatarColor ?? colors.teal }}>{initials(user?.name ?? 'Friend')}</Title>
          </View>
        </Pressable>
      </View>

      <Animated.View entering={FadeInDown.duration(450)}>
        <Label style={{ marginBottom: 10 }}>TODAY’S WORD</Label>
        <MessageCard message={todaysMessage()} featured />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(450)} style={{ marginTop: spacing.xl }}>
        <GlassCard accent={colors.teal} style={{ gap: spacing.md }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Label>CHECK IN</Label>
            {last ? <Muted>{new Date(last.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Muted> : null}
          </Row>
          {last ? (
            <Row gap={10}>
              <View style={[styles.emotionDot, { backgroundColor: getEmotion(last.emotion).color }]} />
              <View style={{ flex: 1 }}>
                <Serif style={{ fontSize: 21 }}>{getEmotion(last.emotion).label}</Serif>
                <Muted>Energy {last.energy} · Calm {last.calmness} · Stress {last.stress}</Muted>
              </View>
            </Row>
          ) : (
            <>
              <Serif style={{ fontSize: 21 }}>How are you arriving?</Serif>
              <Body>Check in by voice or name the feeling yourself.</Body>
            </>
          )}
          <GradientButton label={last ? 'New voice check-in' : 'Start voice check-in'} onPress={() => router.push('/checkin')} full />
          <Pressable onPress={() => router.push('/feel')} style={styles.textAction} accessibilityRole="button">
            <Muted color={colors.lavender}>Name how I feel without voice →</Muted>
          </Pressable>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(450)} style={{ marginTop: spacing.xl }}>
        <Label style={{ marginBottom: 10 }}>INNER PATH</Label>
        <Pressable onPress={() => { tap(); router.push('/side'); }} accessibilityRole="button">
          <View style={styles.pathCard}>
            <LinearGradient colors={[mission.color + '24', 'rgba(102,224,202,0.06)']} style={StyleSheet.absoluteFill} />
            <View style={[styles.pathIcon, { borderColor: mission.color + '66' }]}>
              <Ionicons name={mission.icon} size={23} color={mission.color} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Body color={colors.text} style={{ fontFamily: font.sansBold, fontSize: 16 }}>{mission.title}</Body>
                <Body color={mission.color} style={{ fontFamily: font.sansBold }}>{side.resonance}</Body>
              </Row>
              <Muted>{activeTrees} skill trees active · {side.daily.done.length}/{side.daily.questIds.length} quests today</Muted>
              {nextQuest ? <Body color={colors.text} style={{ fontSize: 13 }} numberOfLines={1}>Next: {nextQuest.title}</Body> : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
          </View>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(450)} style={{ marginTop: spacing.xl }}>
        <Label style={{ marginBottom: 10 }}>EXPLORE</Label>
        <View style={{ gap: spacing.sm }}>
          {TOOLS.map((tool) => (
            <Pressable key={tool.title} onPress={() => { tap(); router.push(tool.route as any); }} accessibilityRole="button" accessibilityLabel={`${tool.title}. ${tool.sub}`}>
              <GlassCard style={styles.toolRow}>
                <View style={[styles.toolIcon, { backgroundColor: tool.color + '1a' }]}>
                  <Ionicons name={tool.icon} size={19} color={tool.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 15 }}>{tool.title}</Body>
                  <Muted style={{ fontSize: 12.5 }}>{tool.sub}</Muted>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
              </GlassCard>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {baseline ? <Muted center style={{ marginTop: spacing.xl }}>Voice baseline set {new Date(baseline.capturedAt).toLocaleDateString()}</Muted> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.xs },
  avatar: { width: 46, height: 46, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  emotionDot: { width: 14, height: 14, borderRadius: 7 },
  textAction: { alignItems: 'center', paddingTop: 2 },
  pathCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.lavender + '44', overflow: 'hidden', backgroundColor: colors.panel },
  pathIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2, borderWidth: 1 },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: spacing.md },
  toolIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
