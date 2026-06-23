import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { getEmotion } from '../lib/emotions';
import { colors, font } from '../theme/theme';

/** A breathing aura in the emotion's color with an optional confidence ring. */
export function EmotionAura({
  emotionId,
  confidence,
  size = 240,
  subtitle,
}: {
  emotionId: string;
  confidence?: number;
  size?: number;
  subtitle?: string;
}) {
  const e = getEmotion(emotionId);
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse]);

  const halo = useAnimatedStyle(() => ({
    opacity: 0.5 + pulse.value * 0.4,
    transform: [{ scale: 0.92 + pulse.value * 0.16 }],
  }));

  const ringR = size * 0.34;
  const circ = 2 * Math.PI * ringR;
  const conf = confidence ?? 1;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[StyleSheet.absoluteFill, halo]}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="aura" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={e.color} stopOpacity={0.5} />
              <Stop offset="60%" stopColor={e.color} stopOpacity={0.18} />
              <Stop offset="100%" stopColor={e.color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#aura)" />
        </Svg>
      </Animated.View>

      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={ringR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
        {confidence != null && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={ringR}
            fill="none"
            stroke={e.color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${circ * conf} ${circ}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </Svg>

      <View style={styles.center}>
        <Text style={[styles.label, { color: e.color }]}>{e.label}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        {confidence != null ? <Text style={styles.conf}>{Math.round(conf * 100)}% confidence</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingHorizontal: 20 },
  label: { fontFamily: font.serif, fontSize: 30, textAlign: 'center' },
  sub: { fontFamily: font.sans, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  conf: { fontFamily: font.sansMedium, fontSize: 11, color: colors.textDim, marginTop: 6, letterSpacing: 0.3 },
});
