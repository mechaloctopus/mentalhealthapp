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
import { todaysMessage } from '../../src/data/messages';
import { getEmotion } from '../../src/lib/emotions';
import { computeProgress } from '../../src/lib/progress';
import { Companion } from '../../src/components/Companion';
import { initials } from '../../src/lib/auth';
import { colors, font, radius, spacing } from '../../src/theme/theme';
import { tap } from '../../src/lib/haptics';

const QUICK = [
  { label: 'Breath', icon: 'leaf' as const, route: '/breath', color: colors.teal },
  { label: 'Stillness', icon: 'moon' as const, route: '/stillness', color: colors.blue },
  { label: 'Loving-kindness', icon: 'heart' as const, route: '/meta', color: colors.coral },
  { label: 'Sound', icon: 'musical-notes' as const, route: '/sound', color: colors.lavender },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Rest well';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Winding down';
}

export default function Today() {
  const router = useRouter();
  const { user, checkins, baseline, sessions, journal } = useApp();
  const progress = computeProgress({ checkins, sessions, journal });
  const msg = todaysMessage();
  const last = checkins[0];
  const firstName = (user?.name ?? 'Friend').split(' ')[0];

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Muted>{greeting()},</Muted>
          <Display style={{ fontSize: 30, marginTop: 2 }}>{firstName}</Display>
        </View>
        <Pressable onPress={() => { tap(); router.push('/profile'); }}>
          <View style={[styles.avatar, { backgroundColor: (user?.avatarColor ?? colors.teal) + '33', borderColor: (user?.avatarColor ?? colors.teal) + '88' }]}>
            <Title style={{ fontSize: 16, color: user?.avatarColor ?? colors.teal }}>{initials(user?.name ?? 'Friend')}</Title>
          </View>
        </Pressable>
      </View>

      {/* Today's word */}
      <Animated.View entering={FadeInDown.duration(500)}>
        <Label style={{ marginBottom: 10 }}>TODAY’S WORD</Label>
        <MessageCard message={msg} featured />
      </Animated.View>

      {/* Side Module entry */}
      <Animated.View entering={FadeInDown.delay(60).duration(500)} style={{ marginTop: spacing.lg }}>
        <Pressable onPress={() => { tap(); router.push('/side'); }}>
          <View style={styles.sideBanner}>
            <LinearGradient colors={['rgba(182,167,255,0.22)', 'rgba(102,224,202,0.10)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <View style={[styles.sideIcon, { borderColor: colors.lavender + '66' }]}>
              <Ionicons name="planet" size={24} color={colors.lavender} />
            </View>
            <View style={{ flex: 1 }}>
              <Body color={colors.text} style={{ fontFamily: font.sansBold, fontSize: 16 }}>The Inner Path</Body>
              <Muted style={{ fontSize: 12.5 }}>Side module · quests, wisdom paths & growth</Muted>
            </View>
            <Ionicons name="arrow-forward" size={18} color={colors.lavender} />
          </View>
        </Pressable>
      </Animated.View>

      {/* Voice check-in card */}
      <Animated.View entering={FadeInDown.delay(80).duration(500)} style={{ marginTop: spacing.xl }}>
        <GlassCard accent={colors.teal} style={{ gap: spacing.md }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Label>VOICE CHECK-IN</Label>
            {last ? <Muted>{new Date(last.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Muted> : null}
          </Row>
          {last ? (
            <>
              <Row gap={10}>
                <View style={[styles.emoDot, { backgroundColor: getEmotion(last.emotion).color }]} />
                <Serif style={{ fontSize: 22 }}>{getEmotion(last.emotion).label}</Serif>
              </Row>
              <Row gap={spacing.lg}>
                <Metric label="Energy" value={last.energy} color={colors.amber} />
                <Metric label="Calm" value={last.calmness} color={colors.teal} />
                <Metric label="Stress" value={last.stress} color={last.stress === 'Elevated' ? colors.coral : colors.moss} isText />
              </Row>
              <GradientButton label="New 60-second check-in" onPress={() => router.push('/checkin')} full />
            </>
          ) : (
            <>
              <Serif style={{ fontSize: 21 }}>How are you arriving today?</Serif>
              <Body>A 30–60 second voice check-in reads your emotion across 12 feelings — then suggests one practice.</Body>
              <GradientButton label="Start voice check-in" onPress={() => router.push('/checkin')} full />
            </>
          )}
          <Pressable onPress={() => { tap(); router.push('/feel'); }} style={styles.feelRow} hitSlop={6}>
            <Ionicons name="color-palette-outline" size={16} color={colors.lavender} />
            <Muted color={colors.lavender}>Or just name how you feel →</Muted>
          </Pressable>
        </GlassCard>
      </Animated.View>

      {/* Quick practices */}
      <Animated.View entering={FadeInDown.delay(160).duration(500)} style={{ marginTop: spacing.xl }}>
        <Label style={{ marginBottom: 12 }}>A GENTLE NEXT STEP</Label>
        <View style={styles.quickGrid}>
          {QUICK.map((q) => (
            <Pressable key={q.label} style={{ width: '48%' }} onPress={() => { tap(); router.push(q.route as any); }}>
              <GlassCard style={styles.quickTile} accent={q.color}>
                <View style={[styles.quickIcon, { backgroundColor: q.color + '22' }]}>
                  <Ionicons name={q.icon} size={20} color={q.color} />
                </View>
                <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 14.5 }}>{q.label}</Body>
              </GlassCard>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* Deepen: guide, journal, sleep */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ marginTop: spacing.xl }}>
        <Label style={{ marginBottom: 12 }}>DEEPEN</Label>
        <View style={{ gap: spacing.sm }}>
          <ToolRow icon="chatbubbles" color={colors.lavender} title="Reflect with your guide" sub="A short CBT-grounded conversation" onPress={() => { tap(); router.push('/coach'); }} />
          <ToolRow icon="book" color={colors.amber} title="Journal" sub={journal.length ? `${journal.length} ${journal.length === 1 ? 'entry' : 'entries'}` : 'Think on paper'} onPress={() => { tap(); router.push('/journal'); }} />
          <ToolRow icon="bed" color={colors.blue} title="Sleep mixer" sub="Layer a soundscape for rest" onPress={() => { tap(); router.push('/sleep'); }} />
        </View>
      </Animated.View>

      {/* Companion strip */}
      <Animated.View entering={FadeInDown.delay(240).duration(500)} style={{ marginTop: spacing.xl }}>
        <Pressable onPress={() => { tap(); router.push('/voice'); }}>
          <GlassCard style={styles.lumenRow} accent={colors.teal}>
            <Companion progress={progress} size={64} />
            <View style={{ flex: 1 }}>
              <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 15 }}>Lumen · {progress.levelName}</Body>
              <Muted style={{ fontSize: 12.5 }}>{progress.streak}-day streak · tap for insights</Muted>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
          </GlassCard>
        </Pressable>
      </Animated.View>

      {/* Daily flow */}
      <Animated.View entering={FadeInDown.delay(280).duration(500)} style={{ marginTop: spacing.xl }}>
        <GlassCard style={{ gap: spacing.md }}>
          <Label>THE DAILY FLOW</Label>
          {['Notification prompt', 'Voice check-in', 'Mood profile', 'Matched practice', 'Trend archive'].map((s, i, arr) => (
            <View key={s}>
              <Row gap={12}>
                <View style={styles.flowNum}><Body color={colors.teal} style={{ fontFamily: font.sansBold, fontSize: 12 }}>{i + 1}</Body></View>
                <Body color={colors.text} style={{ fontSize: 14.5 }}>{s}</Body>
              </Row>
              {i < arr.length - 1 ? <View style={styles.flowLine} /> : null}
            </View>
          ))}
        </GlassCard>
      </Animated.View>

      {baseline ? (
        <Muted center style={{ marginTop: spacing.lg }}>
          Baseline set {new Date(baseline.capturedAt).toLocaleDateString()}
        </Muted>
      ) : null}
    </Screen>
  );
}

function Metric({ label, value, color, isText }: { label: string; value: number | string; color: string; isText?: boolean }) {
  return (
    <View style={{ gap: 2 }}>
      <Title style={{ fontFamily: font.serif, fontSize: isText ? 18 : 24, color }}>{value}</Title>
      <Muted style={{ fontSize: 12 }}>{label}</Muted>
    </View>
  );
}

function ToolRow({ icon, color, title, sub, onPress }: { icon: keyof typeof Ionicons.glyphMap; color: string; title: string; sub: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <GlassCard style={styles.toolRow}>
        <View style={[styles.toolIcon, { backgroundColor: color + '1a' }]}>
          <Ionicons name={icon} size={19} color={color} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 15 }}>{title}</Body>
          <Muted style={{ fontSize: 12.5 }}>{sub}</Muted>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.xs },
  avatar: { width: 46, height: 46, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md },
  quickTile: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md },
  quickIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  flowNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.teal + '22', alignItems: 'center', justifyContent: 'center' },
  emoDot: { width: 14, height: 14, borderRadius: 7 },
  feelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 4 },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: spacing.md },
  toolIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  lumenRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sideBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.lavender + '44', overflow: 'hidden', backgroundColor: colors.panel },
  sideIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(182,167,255,0.16)', borderWidth: 1 },
  flowLine: { width: 1, height: 14, backgroundColor: colors.panelBorder, marginLeft: 11, marginVertical: 2 },
});