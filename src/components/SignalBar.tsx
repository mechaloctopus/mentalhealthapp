import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { colors, font, radius } from '../theme/theme';
import { Text } from 'react-native';

interface Props {
  label: string;
  value: number; // 0-100
  color?: string;
  suffix?: string;
  delay?: number;
}

/** Animated horizontal signal bar used for voice mood metrics. */
export function SignalBar({ label, value, color = colors.teal, suffix = '', delay = 0 }: Props) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(delay, withTiming(Math.max(0, Math.min(100, value)), { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [value, delay, w]);

  const fill = useAnimatedStyle(() => ({ width: `${w.value}%` }));

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{Math.round(value)}{suffix}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fillWrap, fill]}>
          <LinearGradient
            colors={[color + '88', color]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  label: { fontFamily: font.sansMedium, fontSize: 13.5, color: colors.textMuted },
  value: { fontFamily: font.sansBold, fontSize: 15 },
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.hairline, overflow: 'hidden' },
  fillWrap: { height: 8, borderRadius: radius.pill, overflow: 'hidden' },
});
