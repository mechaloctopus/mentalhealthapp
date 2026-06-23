import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, Display, Title, Body, Muted, Label, GlassCard, Serif, Row, Divider } from '../../src/components/ui';
import { MessageCard } from '../../src/components/MessageCard';
import { BrandMark } from '../../src/components/BrandMark';
import { GradientButton } from '../../src/components/GradientButton';
import { useApp } from '../../src/context/AppContext';
import { todaysMessage } from '../../src/data/messages';
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
  const { user, checkins, baseline } = useApp();
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

      {/* Voice check-in card */}
      <Animated.View entering={FadeInDown.delay(80).duration(500)} style={{ marginTop: spacing.xl }}>
        <GlassCard accent={colors.teal} style={{ gap: spacing.md }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Label>VOICE CHECK-IN</Label>
            {last ? <Muted>{new Date(last.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Muted> : null}
          </Row>
          {last ? (
            <>
              <Serif style={{ fontSize: 21 }}>{last.tone}</Serif>
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
              <Body>A 30–60 second voice check-in estimates your energy, calmness, and stress — then suggests one practice.</Body>
              <GradientButton label="Start voice check-in" onPress={() => router.push('/checkin')} full />
            </>
          )}
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

      {/* Daily flow */}
      <Animated.View entering={FadeInDown.delay(220).duration(500)} style={{ marginTop: spacing.xl }}>
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

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.xs },
  avatar: { width: 46, height: 46, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md },
  quickTile: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md },
  quickIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  flowNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.teal + '22', alignItems: 'center', justifyContent: 'center' },
  flowLine: { width: 1, height: 14, backgroundColor: colors.panelBorder, marginLeft: 11, marginVertical: 2 },
});
