import React, { useState } from 'react';
import { Modal, View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Serif, Body, Muted, Label } from './ui';
import { GradientButton } from './GradientButton';
import { colors, font, spacing } from '../theme/theme';
import { tap } from '../lib/haptics';

export interface InfoPoint { heading?: string; text: string }

/**
 * A small "i" affordance that opens a thoughtful explanation sheet — the app's way
 * of teaching gently in context ("more info" without cluttering the screen).
 */
export function InfoButton({
  title,
  intro,
  points,
  footer,
  accent = colors.violet,
  size = 18,
}: {
  title: string;
  intro?: string;
  points: InfoPoint[];
  footer?: string;
  accent?: string;
  size?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => { tap(); setOpen(true); }}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={`About ${title}`}
        style={styles.trigger}
      >
        <Ionicons name="information-circle-outline" size={size} color={colors.textDim} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Animated.View entering={FadeIn.duration(200)} style={StyleSheet.absoluteFill} />
        </Pressable>
        <SafeAreaView style={styles.sheetWrap} edges={['bottom']} pointerEvents="box-none">
          <Animated.View entering={SlideInDown.springify().damping(18)} style={[styles.sheet, { borderColor: accent + '44' }]}>
            <View style={styles.grip} />
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <Label color={accent} style={{ marginBottom: 8 }}>HOW THIS WORKS</Label>
              <Serif style={{ fontSize: 24, marginBottom: intro ? 8 : spacing.md }}>{title}</Serif>
              {intro ? <Body style={{ marginBottom: spacing.md }}>{intro}</Body> : null}
              <View style={{ gap: spacing.md }}>
                {points.map((p, i) => (
                  <View key={i} style={styles.point}>
                    <View style={[styles.bullet, { backgroundColor: accent }]} />
                    <View style={{ flex: 1 }}>
                      {p.heading ? <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 14.5, marginBottom: 2 }}>{p.heading}</Body> : null}
                      <Body style={{ fontSize: 14, lineHeight: 21 }}>{p.text}</Body>
                    </View>
                  </View>
                ))}
              </View>
              {footer ? <Muted style={{ marginTop: spacing.lg, fontSize: 12, lineHeight: 18 }}>{footer}</Muted> : null}
            </ScrollView>
            <GradientButton label="Got it" onPress={() => { tap(); setOpen(false); }} full style={{ marginTop: spacing.lg }} />
          </Animated.View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#14171a',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 1, borderBottomWidth: 0,
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.lg,
    maxHeight: '82%',
  },
  grip: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.surfaceActive, marginBottom: spacing.md },
  point: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  bullet: { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
});
