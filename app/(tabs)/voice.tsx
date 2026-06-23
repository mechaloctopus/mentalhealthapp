import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, Display, Body, Muted, Label, GlassCard, Serif, Row } from '../../src/components/ui';
import { GradientButton } from '../../src/components/GradientButton';
import { SignalBar } from '../../src/components/SignalBar';
import { Sparkline } from '../../src/components/Sparkline';
import { useApp } from '../../src/context/AppContext';
import { colors, font, spacing } from '../../src/theme/theme';

export default function Voice() {
  const router = useRouter();
  const { checkins, baseline } = useApp();
  const { width } = useWindowDimensions();
  const recent = checkins.slice(0, 14).reverse();
  const calmSeries = recent.map((c) => c.calmness);

  return (
    <Screen tint={colors.blue}>
      <View style={styles.header}>
        <Display style={{ fontSize: 32 }}>Voice</Display>
        <Muted style={{ marginTop: 4 }}>Your voice is a signal — not a verdict.</Muted>
      </View>

      <Animated.View entering={FadeInDown.duration(500)}>
        <GlassCard accent={colors.teal} style={{ gap: spacing.md, alignItems: 'center' }}>
          <View style={styles.micHalo}>
            <Ionicons name="mic" size={30} color={colors.teal} />
          </View>
          <Serif center style={{ fontSize: 22 }}>30–60 second check-in</Serif>
          <Body center style={{ maxWidth: 300 }}>
            Read a short line or speak freely. We estimate energy, calmness, and stress on-device, then suggest one practice.
          </Body>
          <GradientButton label="Start check-in" onPress={() => router.push('/checkin')} full />
        </GlassCard>
      </Animated.View>

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
                <View style={{ flex: 1, gap: 2 }}>
                  <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 15 }}>{c.tone}</Body>
                  <Muted style={{ fontSize: 12.5 }}>
                    {new Date(c.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {new Date(c.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                  </Muted>
                </View>
                <Row gap={spacing.md}>
                  <Stat label="E" value={c.energy} color={colors.amber} />
                  <Stat label="C" value={c.calmness} color={colors.teal} />
                  <View style={[styles.stressDot, { backgroundColor: c.stress === 'Elevated' ? colors.coral : c.stress === 'Mild' ? colors.amber : colors.moss }]} />
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
  stressDot: { width: 12, height: 12, borderRadius: 6 },
  disclaimer: { marginTop: spacing.xl, fontSize: 12, lineHeight: 18 },
});
