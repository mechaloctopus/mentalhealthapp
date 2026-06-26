import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../../src/components/AnimatedBackground';
import { ModalHeader } from '../../src/components/ModalHeader';
import { Body, Muted, Label, GlassCard, Serif, Row } from '../../src/components/ui';
import { MoonPhaseGlyph } from '../../src/components/MoonPhaseGlyph';
import { getMoonPhase, type MoonPhaseName } from '../../src/lib/astronomy';
import { colors, font, spacing } from '../../src/theme/theme';

const PHASE_NOTES: Record<MoonPhaseName, string> = {
  'New Moon': 'Traditionally read as a dark, seed-planting moment — the sky offers no light to plan by, so the focus turns inward: setting an intention rather than acting on it yet.',
  'Waxing Crescent': 'The first sliver of light. Folk moon-watching traditions treat this as a time for early, small, exploratory steps on whatever was intended at the new moon.',
  'First Quarter': 'Half-lit, half-dark — often read as a moment of friction or decision, where the initial intention meets its first real obstacle.',
  'Waxing Gibbous': 'Nearly full. Traditionally a time of refinement and adjustment — small corrections before things culminate.',
  'Full Moon': 'Maximum light, and the phase with the deepest folklore across cultures: culmination, illumination, heightened emotion, and (per long-standing but scientifically unconfirmed tradition) disrupted sleep.',
  'Waning Gibbous': 'Just past full. Often associated with gratitude and sharing what has come to fruition.',
  'Last Quarter': 'Half-lit again, light now receding — traditionally tied to release and letting go of what is finished.',
  'Waning Crescent': 'The last sliver before dark. Widely treated as a rest phase: closing out, reflecting, clearing space before the next new moon.',
};

const PHASE_ORDER: MoonPhaseName[] = [
  'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
];

export default function MoonWatcher() {
  const moon = useMemo(() => getMoonPhase(new Date()), []);

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.blue} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ModalHeader title="Moon watcher guide" accent={colors.blue} />
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
          <View style={styles.crestWrap}>
            <MoonPhaseGlyph phase={moon} size={96} />
          </View>
          <Body center style={{ marginTop: spacing.md, fontFamily: font.sansBold, fontSize: 19, color: colors.text }}>{moon.name}</Body>
          <Muted center style={{ marginTop: 2 }}>{(moon.illuminatedFraction * 100).toFixed(0)}% illuminated · {moon.waxing ? 'waxing' : 'waning'}</Muted>

          <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: spacing.lg }}>
            <GlassCard accent={colors.blue} style={{ gap: 8 }}>
              <Label color={colors.blue}>RIGHT NOW</Label>
              <Serif style={{ fontSize: 15.5, lineHeight: 23 }}>{PHASE_NOTES[moon.name]}</Serif>
            </GlassCard>
          </Animated.View>

          <Label style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>THE FULL CYCLE</Label>
          <View style={{ gap: spacing.sm }}>
            {PHASE_ORDER.map((name) => (
              <GlassCard key={name} style={name === moon.name ? { borderColor: colors.blue + '66' } : undefined}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 14 }}>{name}</Body>
                  {name === moon.name ? <Label color={colors.blue}>NOW</Label> : null}
                </Row>
                <Muted style={{ fontSize: 12.5, lineHeight: 19, marginTop: 4 }}>{PHASE_NOTES[name]}</Muted>
              </GlassCard>
            ))}
          </View>

          <Muted style={{ marginTop: spacing.lg, fontSize: 11.5, lineHeight: 17 }}>
            Phase and illumination are computed from real lunar ephemeris data. The traditional
            meanings above are folk and contemplative associations carried across many cultures —
            offered to explore, not as predictive or medical claims.
          </Muted>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  crestWrap: { alignItems: 'center', marginTop: spacing.md },
});
