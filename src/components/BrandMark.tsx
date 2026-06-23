import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '../theme/theme';

/** The MoodSignal brand mark — a glass square with a pulsing teal/coral signal dot. */
export function BrandMark({ size = 40 }: { size?: number }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.ease) }), -1, false);
  }, [pulse]);

  const ring = useAnimatedStyle(() => ({
    opacity: 0.6 - pulse.value * 0.6,
    transform: [{ scale: 0.5 + pulse.value * 1.1 }],
  }));
  const dot = useAnimatedStyle(() => ({
    transform: [{ scale: 0.85 + Math.sin(pulse.value * Math.PI) * 0.18 }],
  }));

  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size * 0.3 }]}>
      <Animated.View style={[styles.ring, { width: size * 0.5, height: size * 0.5, borderRadius: size }, ring]} />
      <Animated.View style={[styles.dot, { width: size * 0.34, height: size * 0.34, borderRadius: size }, dot]} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.panelBorderStrong,
    overflow: 'hidden',
  },
  ring: { position: 'absolute', backgroundColor: colors.teal },
  dot: { backgroundColor: colors.coral },
});
