import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, font } from '../theme/theme';

interface Props {
  resonance: number;
  streak: number;
  activeTrees: number;
  stageColor?: string;
  size?: number;
}

export function Companion({ resonance, streak, activeTrees, stageColor = colors.teal, size = 96 }: Props) {
  const pulse = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      pulse.value = 0.5;
      return;
    }
    pulse.value = withRepeat(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse, reduced]);

  const core = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 + pulse.value * 0.12 }],
    opacity: 0.85 + pulse.value * 0.15,
  }));

  const brightness = Math.min(1, 0.42 + Math.log10(resonance + 1) * 0.16);
  const rings = Math.min(5, activeTrees);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[StyleSheet.absoluteFill, core]}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="lumen" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={stageColor} stopOpacity={brightness} />
              <Stop offset="55%" stopColor={stageColor} stopOpacity={brightness * 0.4} />
              <Stop offset="100%" stopColor={stageColor} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#lumen)" />
          {Array.from({ length: rings }).map((_, index) => (
            <Circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={size * 0.18 + index * (size * 0.065)}
              fill="none"
              stroke={index % 2 === 0 ? stageColor : colors.amber}
              strokeOpacity={0.18 + index * 0.035}
              strokeWidth={1.5}
            />
          ))}
          <Circle cx={size / 2} cy={size / 2} r={size * 0.13} fill={colors.amber} opacity={0.9} />
        </Svg>
      </Animated.View>
      {streak > 0 && (
        <View style={styles.streakBadge} accessibilityLabel={`${streak} day activity rhythm`}>
          <Ionicons name="flame" size={11} color={colors.amber} />
          <Text style={styles.streakText}>{streak}</Text>
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
