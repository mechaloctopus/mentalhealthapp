import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../../src/components/AnimatedBackground';
import { ModalHeader } from '../../src/components/ModalHeader';
import { Body, Muted, Label, GlassCard, Serif, Row } from '../../src/components/ui';
import { CHALDEAN_ORDER, getDayRuler, getHourRuler } from '../../src/lib/astronomy';
import { PLANET_LORE, CHALDEAN_HOUR_NOTE } from '../../src/data/cosmicRim';
import { colors, font, spacing } from '../../src/theme/theme';

function hourTable(now: Date) {
  const rows: { hour: number; label: string; ruler: ReturnType<typeof getDayRuler> }[] = [];
  for (let h = 0; h < 24; h++) {
    const t = new Date(now);
    t.setHours(h, 0, 0, 0);
    const label = `${h.toString().padStart(2, '0')}:00`;
    rows.push({ hour: h, label, ruler: getHourRuler(t) });
  }
  return rows;
}

export default function PlanetaryHours() {
  const now = useMemo(() => new Date(), []);
  const dayRuler = useMemo(() => getDayRuler(now), [now]);
  const currentHour = now.getHours();
  const rows = useMemo(() => hourTable(now), [now]);

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.amber} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ModalHeader title="Planetary hours" accent={colors.amber} />
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
          <Serif style={{ fontSize: 17, lineHeight: 25 }}>A Chaldean guide to which planet traditionally rules each day and hour.</Serif>
          <Muted style={{ marginTop: 8, fontSize: 12.5, lineHeight: 19 }}>{CHALDEAN_HOUR_NOTE}</Muted>

          <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: spacing.lg }}>
            <GlassCard accent={colors.amber} style={{ gap: 6 }}>
              <Label color={colors.amber}>TODAY'S RULER</Label>
              <Row gap={10}>
                <Body style={{ fontSize: 24, color: PLANET_LORE[dayRuler].color }}>{PLANET_LORE[dayRuler].glyph}</Body>
                <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 16 }}>{PLANET_LORE[dayRuler].name}</Body>
              </Row>
            </GlassCard>
          </Animated.View>

          <Label style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>THE CHALDEAN ORDER</Label>
          <GlassCard>
            <Row gap={10} style={{ justifyContent: 'space-between' }}>
              {CHALDEAN_ORDER.map((id) => (
                <View key={id} style={{ alignItems: 'center', gap: 4 }}>
                  <Body style={{ fontSize: 18, color: PLANET_LORE[id].color }}>{PLANET_LORE[id].glyph}</Body>
                  <Muted style={{ fontSize: 10 }}>{PLANET_LORE[id].name}</Muted>
                </View>
              ))}
            </Row>
          </GlassCard>

          <Label style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>TODAY, HOUR BY HOUR</Label>
          <Muted style={{ marginBottom: spacing.sm, fontSize: 12 }}>
            Approximated with sunrise at 06:00 and sunset at 18:00 local time — a location-aware
            version using your real sunrise/sunset is planned (see docs/COSMIC_RIM.md).
          </Muted>
          <View style={{ gap: 6 }}>
            {rows.map((row) => {
              const isNow = row.hour === currentHour;
              const lore = PLANET_LORE[row.ruler];
              return (
                <View key={row.hour} style={[styles.hourRow, isNow && { borderColor: colors.amber + '66', backgroundColor: colors.amber + '12' }]}>
                  <Muted style={{ width: 52 }}>{row.label}</Muted>
                  <Body style={{ fontSize: 15, color: lore.color, width: 22 }}>{lore.glyph}</Body>
                  <Body color={colors.text} style={{ flex: 1, fontSize: 13 }}>{lore.name}</Body>
                  {isNow ? <Label color={colors.amber}>NOW</Label> : null}
                </View>
              );
            })}
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  hourRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.panelBorder, backgroundColor: colors.surface1 },
});
