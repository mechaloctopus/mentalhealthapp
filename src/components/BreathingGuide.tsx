import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '../theme/tokens';

interface Props {
  onComplete: () => void;
}

const PHASES = [
  { label: 'Breathe in', sub: 'Fill your lungs slowly, all the way', count: 4, toScale: 1.5 },
  { label: 'Hold',       sub: 'Rest here, fully filled',              count: 4, toScale: 1.5 },
  { label: 'Breathe out',sub: 'Release completely, slowly',           count: 5, toScale: 0.78 },
  { label: 'Rest',       sub: 'Empty and still',                      count: 2, toScale: 0.78 },
] as const;

type PhaseIdx = 0 | 1 | 2 | 3;
const TOTAL_CYCLES = 4;

const ORB_SIZE   = 150;
const RING2_SIZE = Math.round(ORB_SIZE * 1.32);
const RING3_SIZE = Math.round(ORB_SIZE * 1.68);
const AREA       = Math.round(ORB_SIZE * 2.2);

export function BreathingGuide({ onComplete }: Props) {
  const [phaseIdx, setPhaseIdx] = useState<PhaseIdx>(0);
  const [cycleIdx, setCycleIdx] = useState(0);
  const [countdown, setCountdown] = useState<number>(PHASES[0].count);
  const orbScale  = useRef(new Animated.Value(0.78)).current;
  const outerGlow = useRef(new Animated.Value(0)).current;
  const doneRef   = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phase = PHASES[phaseIdx];
  const isInhaleOrHold = phaseIdx === 0 || phaseIdx === 1;
  const orbColor = isInhaleOrHold ? colors.violet : colors.brandTeal;

  useEffect(() => {
    // Animate orb scale
    Animated.timing(orbScale, {
      toValue: phase.toScale,
      duration: phase.count * 1000,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    }).start();

    // Animate outer glow rings
    Animated.timing(outerGlow, {
      toValue: isInhaleOrHold ? 1 : 0.2,
      duration: 650,
      useNativeDriver: true,
    }).start();

    let remaining = phase.count;
    setCountdown(remaining);

    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        const nextPhaseIdx = ((phaseIdx + 1) % PHASES.length) as PhaseIdx;
        if (nextPhaseIdx === 0) {
          const nextCycle = cycleIdx + 1;
          if (nextCycle >= TOTAL_CYCLES) {
            if (!doneRef.current) { doneRef.current = true; onComplete(); }
            return;
          }
          setCycleIdx(nextCycle);
        }
        setPhaseIdx(nextPhaseIdx);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseIdx, cycleIdx]);

  const ring3Opacity = outerGlow.interpolate({ inputRange: [0.2, 1], outputRange: [0, 0.14] });
  const ring2Opacity = outerGlow.interpolate({ inputRange: [0.2, 1], outputRange: [0.04, 0.28] });

  const centerOff = (size: number) => ({ top: (AREA - size) / 2, left: (AREA - size) / 2 });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settle your signal</Text>
      <Text style={styles.intro}>
        Four gentle breath cycles to calm the mind before your baseline recording.
      </Text>

      {/* Orb area — fixed size, rings positioned absolutely */}
      <View style={[styles.orbArea, { width: AREA, height: AREA }]}>

        {/* Outermost ambient glow ring */}
        <Animated.View style={[
          styles.ring,
          centerOff(RING3_SIZE),
          { width: RING3_SIZE, height: RING3_SIZE, borderRadius: RING3_SIZE / 2,
            borderColor: orbColor, opacity: ring3Opacity,
            transform: [{ scale: orbScale }] },
        ]} />

        {/* Middle ring */}
        <Animated.View style={[
          styles.ring,
          centerOff(RING2_SIZE),
          { width: RING2_SIZE, height: RING2_SIZE, borderRadius: RING2_SIZE / 2,
            borderColor: orbColor, opacity: ring2Opacity,
            transform: [{ scale: orbScale }] },
        ]} />

        {/* Inner main ring — always visible, carries the glow shadow */}
        <Animated.View style={[
          styles.orbRing,
          centerOff(ORB_SIZE),
          { borderColor: orbColor,
            shadowColor: orbColor,
            shadowOpacity: 0.55,
            shadowRadius: 22,
            shadowOffset: { width: 0, height: 0 },
            elevation: 12,
            transform: [{ scale: orbScale }] },
        ]}>
          <View style={[styles.orbCore, { backgroundColor: orbColor }]} />
        </Animated.View>

        {/* Phase label + countdown — centered via absolute fill */}
        <View style={styles.centerOverlay} pointerEvents="none">
          <Text style={styles.phaseLabel}>{phase.label}</Text>
          <Text style={styles.countdown}>{countdown}</Text>
        </View>
      </View>

      <Text style={styles.instruction}>{phase.sub}</Text>

      <View style={styles.cycleDots}>
        {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < cycleIdx && styles.dotDone, i === cycleIdx && styles.dotActive]}
          />
        ))}
      </View>
      <Text style={styles.cycleText}>{cycleIdx + 1} of {TOTAL_CYCLES}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  heading: {
    fontFamily: font.display,
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
  },
  intro: {
    fontFamily: font.serif,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  orbArea: {
    marginVertical: spacing.md,
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  orbRing: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbCore: {
    width: ORB_SIZE * 0.52,
    height: ORB_SIZE * 0.52,
    borderRadius: (ORB_SIZE * 0.52) / 2,
    opacity: 0.22,
  },
  centerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseLabel: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: colors.text,
    letterSpacing: 0.5,
  },
  countdown: {
    fontFamily: font.display,
    fontSize: 44,
    color: colors.text,
    marginTop: -4,
  },

  instruction: {
    fontFamily: font.serif,
    fontSize: 14,
    color: colors.textFaint,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cycleDots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.surface3,
  },
  dotActive: {
    backgroundColor: colors.violet,
    transform: [{ scale: 1.3 }],
  },
  dotDone: {
    backgroundColor: colors.teal,
  },
  cycleText: {
    fontFamily: font.sans,
    fontSize: 12,
    color: colors.textFaint,
    letterSpacing: 0.5,
  },
});
