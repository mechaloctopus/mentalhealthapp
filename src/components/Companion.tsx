import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { Progress } from '../lib/progress';
import { colors, font } from '../theme/theme';

/** "Lumen" — a living orb companion that brightens and gains rings as you grow. */
export function Companion({ progress, size = 96 }: { progress: Progress; size?: number }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse]);

  const core = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 + pulse.value * 0.12 }],
    opacity: 0.85 + pulse.value * 0.15,
  }));

  const brightness = Math.min(1, 0.45 + progress.level * 0.09);
  const rings = Math.min(4, progress.level - 1);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[StyleSheet.absoluteFill, core]}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="lumen" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.teal} stopOpacity={brightness} />
              <Stop offset="55%" stopColor={colors.teal} stopOpacity={brightness * 0.4} />
              <Stop offset="100%" stopColor={colors.teal} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#lumen)" />
          {Array.from({ length: rings }).map((_, i) => (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={size * 0.18 + i * (size * 0.09)}
              fill="none"
              stroke={colors.amber}
              strokeOpacity={0.18 + i * 0.04}
              strokeWidth={1.5}
            />
          ))}
          <Circle cx={size / 2} cy={size / 2} r={size * 0.13} fill={colors.amber} opacity={0.9} />
        </Svg>
      </Animated.View>
      {progress.streak > 0 && (
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={11} color={colors.amber} />
          <Text style={styles.streakText}>{progress.streak}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  streakBadge: {
    position: 'absolute', bottom: -2, right: -2, flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: 'rgba(10,12,11,0.85)', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.amber + '55',
  },
  streakText: { fontFamily: font.sansBold, fontSize: 11, color: colors.amber },
});
