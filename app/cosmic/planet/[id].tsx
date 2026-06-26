import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../../../src/components/AnimatedBackground';
import { ModalHeader } from '../../../src/components/ModalHeader';
import { Display, Body, Muted, Label, GlassCard, Serif, Row } from '../../../src/components/ui';
import { PLANET_LORE } from '../../../src/data/cosmicRim';
import type { PlanetId } from '../../../src/lib/astronomy';
import { colors, spacing } from '../../../src/theme/theme';

export default function PlanetDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lore = PLANET_LORE[id as PlanetId];

  if (!lore) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <SafeAreaView style={{ flex: 1 }}><ModalHeader title="Planet" /></SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={lore.color} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ModalHeader title={lore.name} accent={lore.color} />
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }}>
          <View style={styles.crestWrap}>
            <View style={[styles.crest, { backgroundColor: lore.color + '18', borderColor: lore.color + '55' }]}>
              <Body style={{ fontSize: 40, color: lore.color }}>{lore.glyph}</Body>
            </View>
          </View>
          <Display style={{ fontSize: 28, marginTop: spacing.md, textAlign: 'center' }}>{lore.name}</Display>
          <Muted center style={{ marginTop: 2 }}>{lore.keyword}</Muted>

          <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: spacing.lg, gap: spacing.sm }}>
            <GlassCard accent={lore.color} style={{ gap: 8 }}>
              <Label color={lore.color}>MYTH & LEGEND</Label>
              <Serif style={{ fontSize: 15.5, lineHeight: 24 }}>{lore.myth}</Serif>
            </GlassCard>

            <GlassCard style={{ gap: 10 }}>
              <Label>TRADITIONAL CORRESPONDENCES</Label>
              <CorrespondenceRow label="Day" value={lore.day} />
              <CorrespondenceRow label="Metal" value={lore.metal} />
              <CorrespondenceRow label="Archangel" value={lore.archangel} />
              <CorrespondenceRow label="Greco-Roman" value={lore.greekRoman} />
              <CorrespondenceRow label="Mesopotamian" value={lore.mesopotamian} />
            </GlassCard>

            <GlassCard style={{ gap: 8 }}>
              <Label>PLANETARY ENERGY</Label>
              <Body style={{ fontSize: 14, lineHeight: 21 }}>{lore.correspondence}</Body>
            </GlassCard>

            <GlassCard style={{ gap: 6 }}>
              <Row gap={8}>
                <Label>SOURCE MATERIAL</Label>
              </Row>
              <Muted style={{ fontSize: 12.5, lineHeight: 19 }}>{lore.source}</Muted>
              <Muted style={{ fontSize: 11.5, lineHeight: 17, marginTop: 4 }}>
                Archangel and elemental attributions vary across grimoires and traditions; this is one widely-cited version, offered to explore, not as settled fact.
              </Muted>
            </GlassCard>
          </Animated.View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

function CorrespondenceRow({ label, value }: { label: string; value: string }) {
  return (
    <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Muted style={{ width: 110 }}>{label}</Muted>
      <Body color={colors.text} style={{ flex: 1, fontSize: 13.5, textAlign: 'right' }}>{value}</Body>
    </Row>
  );
}

const styles = StyleSheet.create({
  crestWrap: { alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  crest: { width: 84, height: 84, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
