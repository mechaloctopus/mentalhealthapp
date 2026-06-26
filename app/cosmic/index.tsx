import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, Display, Body, Muted, Label, GlassCard, Serif, Row } from '../../src/components/ui';
import { InfoButton } from '../../src/components/InfoSheet';
import { ZodiacWheel } from '../../src/components/ZodiacWheel';
import { MoonPhaseGlyph } from '../../src/components/MoonPhaseGlyph';
import { getPlanetPositions, getMoonPhase, getDominantPlanet, getDayRuler, getHourRuler } from '../../src/lib/astronomy';
import { PLANET_LORE } from '../../src/data/cosmicRim';
import { colors, font, spacing } from '../../src/theme/theme';
import { tap } from '../../src/lib/haptics';

export default function CosmicRim() {
  const router = useRouter();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const positions = useMemo(() => getPlanetPositions(now), [now]);
  const moon = useMemo(() => getMoonPhase(now), [now]);
  const dominant = useMemo(() => getDominantPlanet(now), [now]);
  const dayRuler = useMemo(() => getDayRuler(now), [now]);
  const hourRuler = useMemo(() => getHourRuler(now), [now]);
  const dominantLore = PLANET_LORE[dominant.planet];

  return (
    <Screen tint={colors.indigo}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Label color={colors.indigo}>COSMIC RIM</Label>
          <Display style={{ fontSize: 26, marginTop: 2 }}>The planetary wheel</Display>
          <Muted style={{ marginTop: 2 }}>Real positions, in the sky right now.</Muted>
        </View>
        <InfoButton
          title="What is the Cosmic Rim?"
          accent={colors.indigo}
          intro="A planetary energy and position guide — not magic, not prediction. Every position shown is computed from real astronomical data."
          points={[
            { heading: 'Real data, always', text: 'Planet positions, the moon phase, and the dominant-planet callout are computed live from an astronomical ephemeris, never invented.' },
            { heading: 'Traditional lore, clearly labeled', text: 'Myths, Agrippa\'s correspondences, and archangel names are offered as traditional material to explore — not asserted as fact.' },
            { heading: 'Your birth echo', text: 'Add your birth date and time to see a faint echo of where the planets stood when you were born, beside where they stand today.' },
          ]}
        />
      </View>

      <Animated.View entering={FadeInDown.duration(450)} style={{ alignItems: 'center', marginTop: spacing.md }}>
        <ZodiacWheel size={320} positions={positions} onSelectPlanet={(id) => { tap(); router.push(`/cosmic/planet/${id}`); }} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(450)} style={{ marginTop: spacing.lg }}>
        <Pressable onPress={() => { tap(); router.push(`/cosmic/planet/${dominant.planet}`); }} accessibilityRole="button">
          <GlassCard accent={dominantLore.color} style={{ gap: 6 }}>
            <Label color={dominantLore.color}>TODAY'S DOMINANT PLANET</Label>
            <Row gap={12}>
              <Body style={{ fontSize: 28, color: dominantLore.color }}>{dominantLore.glyph}</Body>
              <View style={{ flex: 1 }}>
                <Serif style={{ fontSize: 19 }}>{dominantLore.name}</Serif>
                <Muted style={{ fontSize: 12.5 }}>
                  {dominant.reason === 'day-ruler'
                    ? `Chaldean ruler of ${dayRuler === dominant.planet ? "today" : "the day"}`
                    : 'In close aspect to the Sun today'}
                </Muted>
              </View>
            </Row>
          </GlassCard>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(450)} style={{ marginTop: spacing.md }}>
        <Row gap={spacing.sm}>
          <GlassCard style={{ flex: 1, gap: 4 }}>
            <Label>THIS HOUR</Label>
            <Row gap={8}>
              <Body style={{ fontSize: 20, color: PLANET_LORE[hourRuler].color }}>{PLANET_LORE[hourRuler].glyph}</Body>
              <Body color={colors.text} style={{ fontFamily: font.sansSemibold }}>{PLANET_LORE[hourRuler].name}</Body>
            </Row>
          </GlassCard>
          <Pressable style={{ flex: 1 }} onPress={() => { tap(); router.push('/cosmic/moon'); }} accessibilityRole="button">
            <GlassCard style={{ gap: 4, alignItems: 'flex-start' }}>
              <Label>MOON</Label>
              <Row gap={8}>
                <MoonPhaseGlyph phase={moon} size={26} />
                <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 13 }} numberOfLines={1}>{moon.name}</Body>
              </Row>
            </GlassCard>
          </Pressable>
        </Row>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).duration(450)} style={{ marginTop: spacing.xl }}>
        <Label style={{ marginBottom: 10 }}>EXPLORE</Label>
        <View style={{ gap: spacing.sm }}>
          <CosmicLink icon="person-circle-outline" title="Your birth echo" sub="See your birth-moment positions beside today's sky" color={colors.lavender} onPress={() => router.push('/cosmic/birth')} />
          <CosmicLink icon="moon-outline" title="Moon watcher guide" sub="Phases, what they're traditionally for" color={colors.blue} onPress={() => router.push('/cosmic/moon')} />
          <CosmicLink icon="time-outline" title="Planetary hours" sub="The Chaldean guide to ruling hours and days" color={colors.amber} onPress={() => router.push('/cosmic/hours')} />
        </View>
      </Animated.View>

      <Muted center style={{ marginTop: spacing.xl }}>
        Tap any planet glyph on the wheel for its myths, traditional correspondences, and named archangel.
      </Muted>
    </Screen>
  );
}

function CosmicLink({ icon, title, sub, color, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; sub: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="button" accessibilityLabel={`${title}. ${sub}`}>
      <GlassCard style={styles.linkRow}>
        <View style={[styles.linkIcon, { backgroundColor: color + '1a' }]}>
          <Ionicons name={icon} size={19} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 15 }}>{title}</Body>
          <Muted style={{ fontSize: 12.5 }}>{sub}</Muted>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm, marginTop: spacing.xs, gap: spacing.sm },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: spacing.md },
  linkIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
