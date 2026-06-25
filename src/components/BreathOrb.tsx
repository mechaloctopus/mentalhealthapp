import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, font } from '../theme/theme';

export interface BreathPattern {
  inhale: number; // seconds
  hold: number;
  exhale: number;
  rest: number;
}

export const PATTERNS: Record<string, { label: string; pattern: BreathPattern }> = {
  calm: { label: 'Calm (4·4·6·2)', pattern: { inhale: 4, hold: 4, exhale: 6, rest: 2 } },
  box: { label: 'Box (4·4·4·4)', pattern: { inhale: 4, hold: 4, exhale: 4, rest: 4 } },
  relax: { label: 'Relax (4·7·8·0)', pattern: { inhale: 4, hold: 7, exhale: 8, rest: 0 } },
};

type Phase = 'inhale' | 'hold' | 'exhale' | 'rest';
const LABEL: Record<Phase, string> = { inhale: 'Breathe in', hold: 'Hold', exhale: 'Breathe out', rest: 'Rest' };

export function BreathOrb({
  pattern,
  running,
  size = 260,
  accent = colors.teal,
  onCycle,
}: {
  pattern: BreathPattern;
  running: boolean;
  size?: number;
  accent?: string;
  onCycle?: (count: number) => void;
}) {
  const scale = useSharedValue(0.55);
  const glow = useSharedValue(0.3);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cyclesRef = useRef(0);

  useEffect(() => {
    if (!running) {
      if (timer.current) clearTimeout(timer.current);
      scale.value = withTiming(0.55, { duration: 600 });
      glow.value = withTiming(0.3, { duration: 600 });
      return;
    }

    const order: Phase[] = ['inhale', 'hold', 'exhale', 'rest'];
    let i = 0;

    const run = () => {
      // skip zero-length phases
      let p = order[i % order.length];
      while (pattern[p] <= 0) {
        i++;
        p = order[i % order.length];
      }
      setPhase(p);
      const dur = pattern[p] * 1000;

      if (p === 'inhale') {
        scale.value = withTiming(1, { duration: dur, easing: Easing.inOut(Easing.ease) });
        glow.value = withTiming(0.9, { duration: dur, easing: Easing.inOut(Easing.ease) });
      } else if (p === 'exhale') {
        scale.value = withTiming(0.55, { duration: dur, easing: Easing.inOut(Easing.ease) });
        glow.value = withTiming(0.3, { duration: dur, easing: Easing.inOut(Easing.ease) });
      }
      setCount(Math.ceil(pattern[p]));

      timer.current = setTimeout(() => {
        if (p === 'rest' || (p === 'exhale' && pattern.rest <= 0)) {
          cyclesRef.current += 1;
          onCycle?.(cyclesRef.current);
        }
        i++;
        run();
      }, dur);
    };

    run();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, pattern]);

  const orb = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const halo = useAnimatedStyle(() => ({ opacity: glow.value, transform: [{ scale: 0.9 + glow.value * 0.5 }] }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View
        style={[styles.halo, { width: size, height: size, borderRadius: size, backgroundColor: accent }, halo]}
      />
      <Animated.View style={[styles.orb, { width: size * 0.78, height: size * 0.78, borderRadius: size }, orb]}>
        <View style={[styles.ring, { borderColor: accent + '66', width: size * 0.78, height: size * 0.78, borderRadius: size }]} />
        <View style={[styles.ring, { borderColor: accent + '33', width: size * 0.6, height: size * 0.6, borderRadius: size }]} />
        <View style={styles.center}>
          <Text style={[styles.phase, { color: accent }]}>{LABEL[phase]}</Text>
          {running ? <Text style={styles.count}>{count}</Text> : null}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute' },
  orb: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface1 },
  ring: { position: 'absolute', borderWidth: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  phase: { fontFamily: font.sansSemibold, fontSize: 18, letterSpacing: 0.4 },
  count: { fontFamily: font.serif, fontSize: 30, color: colors.text, marginTop: 4 },
});
