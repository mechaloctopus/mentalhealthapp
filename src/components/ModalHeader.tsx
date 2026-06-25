import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Label } from './ui';
import { colors, radius, spacing } from '../theme/theme';
import { tap } from '../lib/haptics';

export function ModalHeader({ title, accent = colors.teal, right }: { title: string; accent?: string; right?: React.ReactNode }) {
  const router = useRouter();
  const close = () => {
    tap();
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };
  return (
    <View style={styles.bar}>
      <Pressable onPress={close} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close">
        <Ionicons name="close" size={22} color={colors.textMuted} />
      </Pressable>
      <Label color={accent}>{title.toUpperCase()}</Label>
      <View style={styles.right}>{right ?? <View style={{ width: 40 }} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  iconBtn: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  right: { minWidth: 40, alignItems: 'flex-end' },
});
