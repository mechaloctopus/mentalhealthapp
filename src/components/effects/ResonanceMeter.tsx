import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, G, Path } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Merkaba, lightningPath, pt } from '../sacred/Geometry';
import { colors, font } from '../../theme/theme';

interface Bolt { id: number; d: string }

/**
 * An "etheric forcefield" resonance meter: concentric harmonic rings rotate inside
 * a breathing radial glow, a Merkaba turns at the core, and static lightning arcs
 * crackle across the field — all intensifying with `intensity` (0..1).
 */
export function ResonanceMeter({
  value,
  caption,
  intensity = 0.4,
  color = colors.violet,
  size = 200,
}: {
  value: number | string;
  caption?: string;
  intensity?: number; // 0..1
  color?: string;
  size?: number;
}) {
  const reduced = useReducedMotion();
  const t = Math.max(0, Math.min(1, intensity));
  const c = size / 2;
  const rot = useSharedValue(0);
  const counter = useSharedValue(0);
  const pulse = useSharedValue(0);
  const [bolts, setBolts] = useState<Bolt[]>([]);
  const boltId = useRef(0);

  useEffect(() => {
    if (reduced) { pulse.value = 0.5; return; }
    rot.value = withRepeat(withTiming(360, { duration: 26000, easing: Easing.linear }), -1, false);
    counter.value = withRepeat(withTiming(-360, { duration: 34000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [reduced, rot, counter, pulse]);

  // Static lightning arcs across the field — more frequent as intensity rises.
  useEffect(() => {
    if (reduced || t < 0.05) return;
    const period = 1700 - t * 1100; // 1700ms → 600ms
    const ringR = size * 0.40;
    const interval = setInterval(() => {
      const bursts = 1 + (Math.random() < t ? 1 : 0);
      const next: Bolt[] = [];
      for (let i = 0; i < bursts; i++) {
        const a1 = Math.random() * 360;
        const a2 = a1 + 70 + Math.random() * 150;
        const [x1, y1] = pt(c, c, ringR, a1);
        const [x2, y2] = pt(c, c, ringR, a2);
        const id = boltId.current++;
        next.push({ id, d: lightningPath(x1, y1, x2, y2, size * 0.18) });
        setTimeout(() => setBolts((b) => b.filter((x) => x.id !== id)), 240);
      }
      setBolts((b) => [...b.slice(-3), ...next]);
    }, period);
    return () => clearInterval(interval);
  }, [reduced, t, size, c]);

  const glow = useAnimatedStyle(() => ({
    opacity: (0.35 + t * 0.4) + pulse.value * (0.15 + t * 0.2),
    transform: [{ scale: 0.9 + pulse.value * (0.08 + t * 0.12) }],
  }));
  const ringSpin = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  const merkabaSpin = useAnimatedStyle(() => ({ transform: [{ rotate: `${counter.value}deg` }] }));

  const ringCount = 3 + Math.round(t * 4); // 3..7 harmonic rings
  const merkabaSize = size * (0.34 + t * 0.12);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* breathing radial glow */}
      <Animated.View style={[StyleSheet.absoluteFill, glow]} pointerEvents="none">
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="rm-glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={color} stopOpacity={0.55} />
              <Stop offset="45%" stopColor={color} stopOpacity={0.22} />
              <Stop offset="100%" stopColor={color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={c} cy={c} r={c} fill="url(#rm-glow)" />
        </Svg>
      </Animated.View>

      {/* rotating harmonic rings */}
      <Animated.View style={[StyleSheet.absoluteFill, ringSpin]} pointerEvents="none">
        <Svg width={size} height={size}>
          <G>
            {Array.from({ length: ringCount }).map((_, i) => {
              const rr = size * (0.16 + (i / ringCount) * 0.28);
              return <Circle key={i} cx={c} cy={c} r={rr} fill="none" stroke={color} strokeOpacity={0.12 + t * 0.18} strokeWidth={1} />;
            })}
            {/* node points on the outer harmonic ring */}
            {Array.from({ length: 6 }).map((_, i) => {
              const [x, y] = pt(c, c, size * 0.4, i * 60);
              return <Circle key={`n${i}`} cx={x} cy={y} r={1.6 + t * 1.6} fill={color} opacity={0.5 + t * 0.4} />;
            })}
          </G>
        </Svg>
      </Animated.View>

      {/* merkaba core */}
      <Animated.View style={merkabaSpin} pointerEvents="none">
        <Merkaba size={merkabaSize} opacity={0.5 + t * 0.4} stroke={1.4} />
      </Animated.View>

      {/* static lightning */}
      {bolts.length > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width={size} height={size}>
            {bolts.map((b) => (
              <Path key={b.id} d={b.d} stroke={colors.white} strokeOpacity={0.9} strokeWidth={1.3} fill="none" strokeLinejoin="round" />
            ))}
          </Svg>
        </View>
      )}
      {/* lightning glow layer */}
      {bolts.length > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width={size} height={size}>
            {bolts.map((b) => (
              <Path key={`g${b.id}`} d={b.d} stroke={color} strokeOpacity={0.5} strokeWidth={4} fill="none" strokeLinejoin="round" />
            ))}
          </Svg>
        </View>
      )}

      {/* center readout */}
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.value}>{value}</Text>
        {caption ? <Text style={[styles.caption, { color }]}>{caption}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  value: { fontFamily: font.display, fontSize: 40, color: colors.text, letterSpacing: 1 },
  caption: { fontFamily: font.sansSemibold, fontSize: 10, letterSpacing: 1.5, marginTop: 2 },
});
