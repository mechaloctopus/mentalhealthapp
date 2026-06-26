import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { GradientButton } from '../src/components/GradientButton';
import { Display, Body, Muted, Label } from '../src/components/ui';
import { useApp } from '../src/context/AppContext';
import { GOALS } from '../src/lib/focus';
import { colors, font, radius, spacing } from '../src/theme/theme';
import { select } from '../src/lib/haptics';

export default function Goals() {
  const router = useRouter();
  const { setFocus, completeOnboarding } = useApp();
  const [chosen, setChosen] = useState<string[]>([]);

  const toggle = (id: string) => {
    select();
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  };

  const next = async () => {
    await setFocus(chosen);
    await completeOnboarding();
    router.replace('/sign-in');
  };

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.violet} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={styles.head}>
          <Label color={colors.violet}>ONE LAST THING</Label>
          <Display style={{ fontSize: 30, marginTop: 8 }}>What would help most?</Display>
          <Muted style={{ marginTop: 6 }}>Pick any that resonate. We’ll tailor your home and suggestions — you can change this anytime.</Muted>
        </View>

        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 24 }}>
          <View style={styles.grid}>
            {GOALS.map((g, i) => {
              const on = chosen.includes(g.id);
              return (
                <Animated.View key={g.id} entering={FadeInDown.delay(Math.min(i, 8) * 40).duration(400)} style={{ width: '48%' }}>
                  <Pressable
                    onPress={() => toggle(g.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={g.label}
                    style={[styles.tile, on && { borderColor: g.color, backgroundColor: g.color + '1a' }]}
                  >
                    <View style={[styles.tileIcon, { backgroundColor: g.color + '22' }]}>
                      <Ionicons name={g.icon} size={20} color={g.color} />
                    </View>
                    <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 14.5 }}>{g.label}</Body>
                    {on ? <Ionicons name="checkmark-circle" size={18} color={g.color} style={styles.tick} /> : null}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </Animated.ScrollView>

        <View style={styles.footer}>
          <GradientButton label={chosen.length ? 'Continue' : 'Skip for now'} onPress={next} full />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md },
  tile: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.panelBorder, backgroundColor: colors.panel, gap: 10, minHeight: 110, justifyContent: 'center' },
  tileIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  tick: { position: 'absolute', top: 10, right: 10 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.sm },
});
