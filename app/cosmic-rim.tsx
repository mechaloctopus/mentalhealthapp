import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Display, Serif, Body, Muted, Label, GlassCard, Chip, Row } from '../src/components/ui';
import { colors, font, radius, spacing } from '../src/theme/theme';

const PLANETS = [
  { name: 'Moon', glyph: '☾', tone: 'body · memory · emotion · rhythm', color: colors.blue },
  { name: 'Mercury', glyph: '☿', tone: 'speech · skill · trade · analysis', color: colors.teal },
  { name: 'Venus', glyph: '♀', tone: 'beauty · love · harmony · attraction', color: colors.lavender },
  { name: 'Sun', glyph: '☉', tone: 'vitality · clarity · authority · purpose', color: colors.amber },
  { name: 'Mars', glyph: '♂', tone: 'action · heat · courage · conflict', color: colors.coral },
  { name: 'Jupiter', glyph: '♃', tone: 'growth · law · wisdom · blessing', color: colors.moss },
  { name: 'Saturn', glyph: '♄', tone: 'time · structure · limits · discipline', color: colors.indigo },
] as const;

const ZODIAC = ['♈︎', '♉︎', '♊︎', '♋︎', '♌︎', '♍︎', '♎︎', '♏︎', '♐︎', '♑︎', '♒︎', '♓︎'];

const ROADMAP = [
  'Live moon phase on the Today dashboard',
  'Current positions for the seven classical planets',
  'Birth Echo overlay from birthday, time, and place',
  'Planetary day and hour ruler guide',
  'Cited myth, lore, constellations, and historical correspondences',
  'Future AR sky view with planet and constellation overlays',
];

export default function CosmicRim() {
  return (
    <Screen tint={colors.indigo}>
      <View style={styles.headerIcon}>
        <Ionicons name="planet" size={26} color={colors.lavender} />
      </View>
      <Label color={colors.lavender} center>COSMIC RIM</Label>
      <Display center style={{ marginTop: spacing.xs }}>Sky rhythm guide</Display>
      <Body center style={{ marginTop: spacing.sm }}>
        A symbolic observatory for the moon, seven classical planets, zodiac wheel, planetary hours, and historical sky lore.
      </Body>

      <GlassCard accent={colors.lavender} style={{ marginTop: spacing.xl, gap: spacing.md }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label color={colors.lavender}>PREVIEW WHEEL</Label>
          <Chip label="Static map" color={colors.lavender} filled />
        </Row>
        <View style={styles.wheel}>
          {ZODIAC.map((glyph, index) => (
            <View key={glyph} style={[styles.zodiacGlyph, positionOnWheel(index, 12, 112)]}>
              <Body color={colors.text} style={styles.zodiacText}>{glyph}</Body>
            </View>
          ))}
          <View style={styles.innerWheel}>
            <Serif center style={{ fontSize: 46, lineHeight: 56 }}>☾</Serif>
            <Muted center>Moon phase card will live here first.</Muted>
          </View>
        </View>
      </GlassCard>

      <GlassCard accent={colors.teal} style={{ marginTop: spacing.lg, gap: spacing.md }}>
        <Label>TODAY’S SKY</Label>
        <Body>
          This first version is a visitable concept screen. The next build step is wiring real moon phase data, then planetary longitude data.
        </Body>
        <View style={styles.planetGrid}>
          {PLANETS.map((planet) => (
            <View key={planet.name} style={styles.planetCard}>
              <Body color={planet.color} style={styles.planetGlyph}>{planet.glyph}</Body>
              <Body color={colors.text} style={styles.planetName}>{planet.name}</Body>
              <Muted style={{ fontSize: 11 }}>{planet.tone}</Muted>
            </View>
          ))}
        </View>
      </GlassCard>

      <GlassCard accent={colors.amber} style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        <Label color={colors.amber}>BIRTH ECHO</Label>
        <Serif>Semi-transparent natal positions</Serif>
        <Body>
          Planned flow: enter birth date, time, and location; place those positions as faint glyphs on the wheel; then animate forward to today’s sky.
        </Body>
      </GlassCard>

      <GlassCard accent={colors.moss} style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        <Label color={colors.moss}>PLANETARY HOURS</Label>
        <Serif>Chaldean order as timing reference</Serif>
        <Body>
          The guide will calculate day and hour rulers using Saturn → Jupiter → Mars → Sun → Venus → Mercury → Moon, framed as symbolic timing rather than prediction.
        </Body>
      </GlassCard>

      <GlassCard accent={colors.blue} style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        <Label color={colors.blue}>BUILD ROADMAP</Label>
        {ROADMAP.map((item) => (
          <Row key={item} gap={10}>
            <View style={styles.dot} />
            <Body style={{ flex: 1 }}>{item}</Body>
          </Row>
        ))}
      </GlassCard>

      <Muted center style={{ marginTop: spacing.xl }}>
        Cosmic Rim should stay optional, cited, symbolic, and clearly separated from medical or therapeutic advice.
      </Muted>
    </Screen>
  );
}

function positionOnWheel(index: number, total: number, radiusPx: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    transform: [
      { translateX: Math.cos(angle) * radiusPx },
      { translateY: Math.sin(angle) * radiusPx },
    ],
  };
}

const styles = StyleSheet.create({
  headerIcon: {
    alignSelf: 'center',
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.lavender + '55',
    marginBottom: spacing.sm,
  },
  wheel: {
    height: 292,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.panelBorderStrong,
    backgroundColor: colors.surface1,
    overflow: 'hidden',
  },
  zodiacGlyph: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.panelBorder,
  },
  zodiacText: { fontSize: 20, lineHeight: 25 },
  innerWheel: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.bgDeep,
    borderWidth: 1,
    borderColor: colors.lavender + '55',
  },
  planetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  planetCard: {
    width: '47%',
    minHeight: 118,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.panelBorder,
  },
  planetGlyph: { fontSize: 34, lineHeight: 40, fontFamily: font.serif },
  planetName: { fontFamily: font.sansBold, marginTop: 2 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.blue,
    marginTop: 8,
  },
});
