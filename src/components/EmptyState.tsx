import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, Serif, Body } from './ui';
import { GradientButton } from './GradientButton';
import { colors, spacing } from '../theme/theme';

/** Consistent, gentle empty state used across lists. */
export function EmptyState({
  icon,
  title,
  body,
  accent = colors.violet,
  cta,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  accent?: string;
  cta?: { label: string; onPress: () => void };
}) {
  return (
    <GlassCard style={styles.wrap}>
      <View style={[styles.halo, { backgroundColor: accent + '16', borderColor: accent + '44' }]}>
        <Ionicons name={icon} size={26} color={accent} />
      </View>
      <Serif center style={{ fontSize: 19 }}>{title}</Serif>
      <Body center color={colors.textDim} style={{ maxWidth: 260 }}>{body}</Body>
      {cta ? <GradientButton label={cta.label} onPress={cta.onPress} style={{ marginTop: spacing.xs }} /> : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  halo: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 4 },
});
