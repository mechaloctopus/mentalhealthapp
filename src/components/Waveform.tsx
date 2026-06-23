import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/theme';

function Bar({ index, active, level }: { index: number; active: boolean; level: Animated.SharedValue<number> }) {
  const t = useSharedValue(0);
  useEffect(() => {
    const dur = 520 + (index % 5) * 130;
    t.value = withRepeat(withTiming(1, { duration: dur, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [index, t]);

  const style = useAnimatedStyle(() => {
    const base = 0.22 + Math.abs(Math.sin((t.value + index * 0.35) * Math.PI)) * 0.78;
    const amp = active ? 0.35 + level.value * 0.65 : 0.12;
    const h = 6 + base * amp * 52;
    return { height: h, opacity: active ? 0.55 + level.value * 0.45 : 0.3 };
  });

  return <Animated.View style={[styles.bar, style]} />;
}

/** Reactive voice waveform. `level` (0..1 shared value) modulates amplitude live. */
export function Waveform({ active, level, count = 28 }: { active: boolean; level: Animated.SharedValue<number>; count?: number }) {
  return (
    <View style={styles.wrap}>
      {Array.from({ length: count }).map((_, i) => (
        <Bar key={i} index={i} active={active} level={level} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: 70 },
  bar: { width: 4, borderRadius: 4, backgroundColor: colors.teal },
});
