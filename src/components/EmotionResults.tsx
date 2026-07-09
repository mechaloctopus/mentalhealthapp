import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { rankEmotions } from '../content/emotions';
import { baselineShift } from '../engine/voice';
import { GlassCard } from './GlassCard';
import { GradientButton } from './GradientButton';
import { colors, font, spacing } from '../theme/tokens';
import type { Affect, Baseline } from '../engine/voice';

interface Props {
  affect: Affect;
  baseline: Baseline | null;
  isBaselineResult?: boolean;
  onDismiss: () => void;
}

export function EmotionResults({ affect, baseline, isBaselineResult = false, onDismiss }: Props) {
  const ranked = rankEmotions(affect.valence, affect.arousal);
  const primary = ranked[0]!.emotion;
  const shift = (!isBaselineResult && baseline)
    ? baselineShift({ valence: affect.valence, arousal: affect.arousal }, baseline)
    : null;
  const topScore = ranked[0]!.score;

  const confidenceLabel =
    affect.confidence < 0.35 ? 'Light reading'
    : affect.confidence < 0.65 ? 'Moderate reading'
    : 'Clear reading';

  const stressColor =
    affect.stress === 'Elevated' ? colors.coral
    : affect.stress === 'Mild' ? colors.amber
    : colors.teal;

  // ── Entrance animations ──────────────────────────────────────────────
  const nameOpacity  = useRef(new Animated.Value(0)).current;
  const nameSlide    = useRef(new Animated.Value(10)).current;
  const barAnims     = useRef(ranked.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      // Primary emotion name fades + slides up
      Animated.timing(nameOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(nameSlide,   { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
      // Bars stagger in from 0 → target width
      Animated.stagger(45,
        barAnims.map((anim) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 480,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          })
        )
      ),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GlassCard strong blur style={styles.card}>
      {isBaselineResult ? (
        <Text style={styles.headerLabel}>BASELINE CAPTURED</Text>
      ) : (
        <Text style={styles.headerLabel}>TODAY'S SIGNAL</Text>
      )}

      {/* Primary emotion — animated entrance */}
      <Animated.View style={[styles.primaryRow, {
        opacity: nameOpacity,
        transform: [{ translateY: nameSlide }],
      }]}>
        <View style={[styles.primaryDot, { backgroundColor: primary.color }]} />
        <Text style={[styles.primaryName, { color: primary.color }]}>{primary.label}</Text>
      </Animated.View>
      <Text style={styles.blurb}>{primary.blurb}</Text>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <Text style={styles.metaChip}>{confidenceLabel}</Text>
        <Text style={[styles.metaChip, { color: stressColor }]}>
          {affect.stress} stress
        </Text>
        {shift !== null && (
          <Text style={[styles.metaChip, { color: shift >= 0 ? colors.teal : colors.coral }]}>
            {shift >= 0 ? `+${shift}` : `${shift}`} vs baseline
          </Text>
        )}
      </View>

      {isBaselineResult && (
        <Text style={styles.baselineNote}>
          Your baseline signal is saved. Future check-ins will be scored against this.
        </Text>
      )}

      {/* 12-emotion signal bars — staggered entrance */}
      <Text style={styles.sectionLabel}>Signal across all 12 tones</Text>
      <View style={styles.bars}>
        {ranked.map(({ emotion, score }, i) => {
          const isPrimary = i === 0;
          const barWidth  = topScore > 0 ? (score / topScore) * 100 : 0;
          return (
            <View key={emotion.id} style={styles.barRow}>
              <Text style={[styles.barLabel, isPrimary && { color: emotion.color }]}>
                {emotion.label}
              </Text>
              <View style={styles.barTrack}>
                <Animated.View style={[styles.barFill, {
                  width: barAnims[i]!.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', `${barWidth}%`],
                  }),
                  backgroundColor: isPrimary ? emotion.color : `${emotion.color}55`,
                }]} />
              </View>
              <Text style={styles.barScore}>{score}</Text>
            </View>
          );
        })}
      </View>

      <GradientButton
        label={isBaselineResult ? 'Begin check-in' : 'Done'}
        variant={isBaselineResult ? 'flame' : 'ghost'}
        onPress={onDismiss}
      />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.xl, gap: spacing.md },
  headerLabel: {
    fontFamily: font.sansSemibold,
    fontSize: 10,
    color: colors.textFaint,
    letterSpacing: 1.6,
  },
  primaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primaryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  primaryName: {
    fontFamily: font.display,
    fontSize: 28,
    letterSpacing: 0.3,
  },
  blurb: {
    fontFamily: font.serif,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginTop: -spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaChip: {
    fontFamily: font.sansSemibold,
    fontSize: 11,
    color: colors.textFaint,
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
  },
  baselineNote: {
    fontFamily: font.serif,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  sectionLabel: {
    fontFamily: font.sansSemibold,
    fontSize: 10,
    color: colors.textFaint,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  bars: { gap: 6 },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  barLabel: {
    fontFamily: font.sans,
    fontSize: 11,
    color: colors.textDim,
    width: 76,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surface2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  barScore: {
    fontFamily: font.sans,
    fontSize: 10,
    color: colors.textFaint,
    width: 24,
    textAlign: 'right',
  },
});
