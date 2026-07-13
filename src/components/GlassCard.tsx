import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius } from '../theme/tokens';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  strong?: boolean;
  /** Use real backdrop blur for floating/overlay cards. Degrades gracefully on older Android. */
  blur?: boolean;
}

export function GlassCard({ children, style, strong, blur }: Props) {
  if (blur) {
    return (
      <BlurView
        intensity={28}
        tint="dark"
        style={[styles.card, strong && styles.strong, styles.blurCard, style]}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[styles.card, strong && styles.strong, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    overflow: 'hidden',
  },
  blurCard: {
    backgroundColor: 'rgba(12,15,14,0.62)',
  },
  strong: {
    borderColor: colors.panelBorderStrong,
  },
});
