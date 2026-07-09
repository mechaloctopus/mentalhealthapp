import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../store';
import { colors, font, spacing } from '../theme/tokens';
import type { Milestone } from '../lib/milestones';

export function ResonanceMoment() {
  const pendingMilestone = useStore((s) => s.pendingMilestone);
  const clearPendingMilestone = useStore((s) => s.setPendingMilestone);

  const slideY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!pendingMilestone) return;

    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => dismiss(), 4500);
    return () => clearTimeout(timer);
  }, [pendingMilestone]);

  function dismiss() {
    Animated.parallel([
      Animated.timing(slideY, { toValue: -120, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      clearPendingMilestone(null);
      slideY.setValue(-120);
      opacity.setValue(0);
    });
  }

  if (!pendingMilestone) return null;
  const m: Milestone = pendingMilestone;

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY: slideY }], opacity }]}>
      <Pressable onPress={dismiss} style={styles.inner}>
        <View style={styles.left}>
          <Text style={styles.tag}>MILESTONE UNLOCKED</Text>
          <Text style={styles.title}>{m.title}</Text>
          <Text style={styles.desc} numberOfLines={2}>{m.desc}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.plus}>+{m.resonance}</Text>
          <Text style={styles.rLabel}>Resonance</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 999,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.violet,
    shadowColor: colors.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  left: { flex: 1, gap: 3 },
  tag: {
    fontFamily: font.sansSemibold,
    fontSize: 9,
    color: colors.violet,
    letterSpacing: 1.4,
  },
  title: {
    fontFamily: font.display,
    fontSize: 18,
    color: colors.text,
  },
  desc: {
    fontFamily: font.serif,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  right: { alignItems: 'center', gap: 2 },
  plus: {
    fontFamily: font.displayBold,
    fontSize: 22,
    color: colors.violet,
  },
  rLabel: {
    fontFamily: font.sansSemibold,
    fontSize: 9,
    color: colors.textFaint,
    letterSpacing: 0.8,
  },
});
