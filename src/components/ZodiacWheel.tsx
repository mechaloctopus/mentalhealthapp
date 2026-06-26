// The Cosmic Rim wheel: 12 zodiac glyphs on the rim, the 7 classical planets placed at
// their real current ecliptic longitude, and an optional semi-transparent "echo" layer
// showing where the planets stood at a person's birth moment. Longitude 0° (the start of
// Aries) is placed at the top of the wheel; the wheel reads clockwise with increasing
// ecliptic longitude.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { pt } from './sacred/Geometry';
import { ZODIAC_LORE, PLANET_LORE } from '../data/cosmicRim';
import type { PlanetPosition } from '../lib/astronomy';
import { colors } from '../theme/theme';

function longitudeToDeg(longitude: number): number {
  return -90 + longitude;
}

export function ZodiacWheel({
  size,
  positions,
  echoPositions,
  onSelectPlanet,
}: {
  size: number;
  positions: PlanetPosition[];
  echoPositions?: PlanetPosition[];
  onSelectPlanet?: (id: PlanetPosition['id']) => void;
}) {
  const c = size / 2;
  const rimR = c - 18;
  const signR = c - 32;
  const planetR = rimR * 0.62;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={c} cy={c} r={rimR} stroke={colors.panelBorderStrong} strokeWidth={1} fill="none" />
        <Circle cx={c} cy={c} r={planetR + 14} stroke={colors.panelBorder} strokeWidth={1} fill="none" />
        <G>
          {Array.from({ length: 12 }).map((_, i) => {
            const [x1, y1] = pt(c, c, rimR, -90 + i * 30);
            const [x2, y2] = pt(c, c, rimR - 10, -90 + i * 30);
            return <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors.panelBorder} strokeWidth={1} />;
          })}
        </G>
      </Svg>

      {ZODIAC_LORE.map((z, i) => {
        const [x, y] = pt(c, c, signR, -90 + i * 30 + 15);
        return (
          <Text key={z.sign} style={[styles.signGlyph, { left: x - 10, top: y - 11 }]}>
            {z.glyph}
          </Text>
        );
      })}

      {echoPositions?.map((p) => {
        const [x, y] = pt(c, c, planetR, longitudeToDeg(p.longitude));
        const lore = PLANET_LORE[p.id];
        return (
          <View key={`echo-${p.id}`} style={[styles.planetDot, { left: x - 12, top: y - 12, opacity: 0.32 }]}>
            <Text style={[styles.planetGlyph, { color: lore.color }]}>{lore.glyph}</Text>
          </View>
        );
      })}

      {positions.map((p) => {
        const [x, y] = pt(c, c, planetR, longitudeToDeg(p.longitude));
        const lore = PLANET_LORE[p.id];
        return (
          <Text
            key={p.id}
            onPress={onSelectPlanet ? () => onSelectPlanet(p.id) : undefined}
            style={[styles.planetGlyph, styles.planetDot, { left: x - 12, top: y - 12, color: lore.color }]}
          >
            {lore.glyph}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  signGlyph: { position: 'absolute', width: 20, height: 22, textAlign: 'center', fontSize: 15, color: colors.textMuted },
  planetDot: { position: 'absolute', width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  planetGlyph: { fontSize: 18, textAlign: 'center', width: 24, height: 24, lineHeight: 24, fontWeight: '600' },
});
