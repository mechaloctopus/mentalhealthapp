import React from 'react';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, font, radius, spacing, gradients } from '../theme/tokens';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'flame' | 'teal' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export function GradientButton({ label, onPress, variant = 'flame', disabled, style }: Props) {
  if (variant === 'ghost') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [styles.ghost, pressed && styles.pressed, disabled && styles.disabled, style]}
      >
        <Text style={styles.ghostLabel}>{label}</Text>
      </Pressable>
    );
  }

  const grad = variant === 'teal' ? gradients.teal : gradients.flame;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed, disabled && styles.disabled, style]}
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
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.4 },
});
