import React from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { colors, font, radius, spacing, gradients } from '../theme/tokens';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'flame' | 'teal' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function GradientButton({ label, onPress, variant = 'flame', disabled, style }: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function pressIn() {
    scale.value = withSpring(0.96, { stiffness: 480, damping: 20 });
  }
  function pressOut() {
    scale.value = withSpring(1, { stiffness: 350, damping: 16 });
  }

  if (variant === 'ghost') {
    return (
      <Animated.View style={[animStyle, style]}>
        <Pressable
          onPress={disabled ? undefined : onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          style={[styles.ghost, disabled && styles.disabled]}
        >
          <Text style={styles.ghostLabel}>{label}</Text>
        </Pressable>
      </Animated.View>
    );
  }

  const grad = variant === 'teal' ? gradients.teal : gradients.flame;

  return (
    <Animated.View style={[styles.wrapper, animStyle, style]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={disabled && styles.disabled}
      >
        <LinearGradient
          colors={[...grad]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text style={styles.label}>{label}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  label: {
    fontFamily: font.sansBold,
    fontSize: 15,
    color: colors.white,
    letterSpacing: 0.4,
  },
  ghost: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.panelBorderStrong,
    alignItems: 'center',
  },
  ghostLabel: {
    fontFamily: font.sansSemibold,
    fontSize: 15,
    color: colors.textMuted,
    letterSpacing: 0.4,
  },
  disabled: { opacity: 0.4 },
});
