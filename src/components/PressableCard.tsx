import React from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { GlassCard } from './ui';
import { tap } from '../lib/haptics';

/**
 * A tappable card with consistent press feedback (subtle scale + haptic) and
 * accessibility — so every interactive card across the app feels the same.
 */
export function PressableCard({
  children,
  onPress,
  accent,
  style,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onPress: () => void;
  accent?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={aStyle}>
      <Pressable
        onPress={() => { tap(); onPress(); }}
        onPressIn={() => (scale.value = withTiming(0.98, { duration: 90 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 120 }))}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <GlassCard accent={accent} style={style}>{children}</GlassCard>
      </Pressable>
    </Animated.View>
  );
}
