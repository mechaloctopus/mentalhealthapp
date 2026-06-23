import React from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, font, gradients, radius } from '../theme/theme';
import { press as hapticPress } from '../lib/haptics';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: 'brand' | 'ghost' | 'solid';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  full?: boolean;
}

export function GradientButton({ label, onPress, variant = 'brand', icon, loading, disabled, style, full }: Props) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    if (disabled || loading) return;
    hapticPress();
    onPress?.();
  };

  const content = (
    <View style={styles.inner}>
      {loading ? (
        <ActivityIndicator color={variant === 'brand' ? colors.black : colors.text} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              variant === 'brand' ? { color: colors.black } : { color: colors.text },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <Animated.View style={[full && { alignSelf: 'stretch' }, aStyle, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => (scale.value = withTiming(0.97, { duration: 90 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 120 }))}
        disabled={disabled || loading}
        style={({ pressed }) => [{ opacity: disabled ? 0.5 : 1 }]}
      >
        {variant === 'brand' ? (
          <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.base}>
            {content}
          </LinearGradient>
        ) : (
          <View style={[styles.base, variant === 'ghost' ? styles.ghost : styles.solid]}>{content}</View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.panelBorderStrong },
  solid: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: colors.panelBorder },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontFamily: font.sansSemibold, fontSize: 15.5, letterSpacing: 0.2 },
});
