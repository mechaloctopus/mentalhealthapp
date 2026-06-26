import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, font, radius } from '../../theme/theme';

export type BarStyle = 'plasma' | 'crystalline' | 'pulse' | 'aurora';

interface Props {
  value: number; // 0..1
  color?: string;
  color2?: string;
  label?: string;
  valueText?: string;
  variant?: BarStyle;
  height?: number;
  delay?: number;
}

function lighten(hex: string, amt = 40): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((n >> 16) & 255) + amt);
  const g = Math.min(255, ((n >> 8) & 255) + amt);
  const b = Math.min(255, (n & 255) + amt);
  return `rgb(${r},${g},${b})`;
}

/** A glowing, animated stat bar with several special-effect styles. */
export function EtherealBar({ value, color = colors.violet, color2, label, valueText, variant = 'plasma', height = 12, delay = 0 }: Props) {
  const reduced = useReducedMotion();
  const v = Math.max(0, Math.min(1, value));
  const fill = useSharedValue(0);
  const flow = useSharedValue(0);
  const c2 = color2 ?? lighten(color, 60);

  useEffect(() => {
    fill.value = withDelay(delay, withTiming(v, { duration: 900, easing: Easing.out(Easing.cubic) }));
    if (!reduced) flow.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true);
    else flow.value = 0.5;
  }, [v, delay, reduced, fill, flow]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.4 + flow.value * 0.45 }));
  const shimmerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: interpolate(flow.value, [0, 1], [-40, 160]) }], opacity: 0.25 + flow.value * 0.3 }));
  const pulseDotStyle = useAnimatedStyle(() => ({ left: `${interpolate(flow.value, [0, 1], [0, Math.max(0, v * 100 - 6)])}%`, opacity: 0.6 + flow.value * 0.4 }));

  const SEGMENTS = 14;
  const litSegments = Math.round(v * SEGMENTS);

  return (
    <View style={styles.wrap}>
      {(label || valueText) && (
        <View style={styles.head}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {valueText ? <Text style={[styles.value, { color: c2 }]}>{valueText}</Text> : null}
        </View>
      )}

      {variant === 'crystalline' ? (
        <View style={[styles.track, { height, backgroundColor: 'transparent', borderWidth: 0, flexDirection: 'row', gap: 3 }]}>
          {Array.from({ length: SEGMENTS }).map((_, i) => {
            const lit = i < litSegments;
            return (
              <View
                key={i}
                style={[
                  styles.segment,
                  { height, backgroundColor: lit ? color : 'rgba(255,255,255,0.06)' },
                  lit && { shadowColor: color, shadowOpacity: 0.9, shadowRadius: 5, borderColor: c2, borderWidth: 0.5 },
                ]}
              />
            );
          })}
        </View>
      ) : (
        <View style={[styles.track, { height }]}>
          <Animated.View style={[styles.fillWrap, { height }, fillStyle]}>
            <LinearGradient
              colors={variant === 'aurora' ? [color, c2, color] : [color, c2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            {/* outer glow */}
            <Animated.View style={[StyleSheet.absoluteFill, { shadowColor: color, shadowOpacity: 1, shadowRadius: 8, backgroundColor: 'transparent' }, glowStyle]} />
            {/* plasma/aurora shimmer sweep */}
            {(variant === 'plasma' || variant === 'aurora') && (
              <Animated.View style={[styles.shimmer, { height }, shimmerStyle]}>
                <LinearGradient colors={['transparent', 'rgba(255,255,255,0.55)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              </Animated.View>
            )}
          </Animated.View>
          {/* pulse traveling dot */}
          {variant === 'pulse' && v > 0.02 && (
            <Animated.View style={[styles.pulseDot, { top: height / 2 - 4, backgroundColor: colors.white, shadowColor: color }, pulseDotStyle]} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 7 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  label: { fontFamily: font.sansMedium, fontSize: 13, color: colors.textMuted },
  value: { fontFamily: font.sansBold, fontSize: 13.5 },
  track: { borderRadius: radius.pill, backgroundColor: colors.hairline, overflow: 'hidden' },
  fillWrap: { borderRadius: radius.pill, overflow: 'hidden' },
  shimmer: { position: 'absolute', width: 40, top: 0, bottom: 0 },
  pulseDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, shadowOpacity: 1, shadowRadius: 6 },
  segment: { flex: 1, borderRadius: 3 },
});
