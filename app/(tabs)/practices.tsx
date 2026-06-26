import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, Display, Body, Muted, Label, GlassCard, Serif } from '../../src/components/ui';
import { colors, font, radius, spacing } from '../../src/theme/theme';
import { tap } from '../../src/lib/haptics';

interface Practice {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
  meta: string;
}

const PRACTICES: Practice[] = [
  { title: 'Breath', subtitle: 'Guided paced breathing for settling and focus', icon: 'leaf', route: '/breath', color: colors.teal, meta: '4–60 min' },
  { title: 'Perfect Stillness', subtitle: 'A slow body scan — observation before story', icon: 'moon', route: '/stillness', color: colors.blue, meta: '8 min' },
  { title: 'Loving-kindness', subtitle: 'Goodwill, forgiveness, and connection', icon: 'heart', route: '/meta', color: colors.coral, meta: '6 min' },
  { title: 'Sound', subtitle: 'Ambient tones for rest and focused attention', icon: 'musical-notes', route: '/sound', color: colors.lavender, meta: 'Presets' },
  { title: 'Sleep mixer', subtitle: 'Layer rain, waves, and tones into a soundscape', icon: 'bed', route: '/sleep', color: colors.amber, meta: 'Mixer' },
];

const HABITS = [
  { title: 'Steady nourishment', body: 'Choose regular meals, water, and a simple food plan that supports stable energy through the day.', icon: 'nutrition-outline' as const, color: colors.moss },
  { title: 'Sleep and screen boundaries', body: 'Dim the room, reduce late-night stimulation, and make the last part of the day easier on your attention.', icon: 'bed-outline' as const, color: colors.amber },
];

export default function Practices() {
  const router = useRouter();
  return (
    <Screen tint={colors.moss}>
      <View style={styles.header}>
        <Display style={{ fontSize: 32 }}>Practices</Display>
        <Muted style={{ marginTop: 4 }}>Simple ways to regulate, reflect, and restore.</Muted>
      </View>

      <View style={{ gap: spacing.md }}>
        {PRACTICES.map((practice, index) => (
          <Animated.View key={practice.title} entering={FadeInDown.delay(index * 70).duration(500)}>
            <Pressable
              onPress={() => { tap(); router.push(practice.route as any); }}
              accessibilityRole="button"
              accessibilityLabel={`${practice.title}. ${practice.subtitle}. ${practice.meta}`}
            >
              <View style={[styles.card, { borderColor: practice.color + '40' }]}>
                <LinearGradient colors={[practice.color + '1c', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                <View style={[styles.icon, { backgroundColor: practice.color + '22', borderColor: practice.color + '55' }]}>
                  <Ionicons name={practice.icon} size={24} color={practice.color} />
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Serif style={{ fontSize: 20 }}>{practice.title}</Serif>
                  <Body style={{ fontSize: 13.5 }}>{practice.subtitle}</Body>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <Muted style={{ fontSize: 11.5, color: practice.color }}>{practice.meta}</Muted>
                  <Ionicons name="arrow-forward" size={18} color={colors.textDim} />
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      <Label style={{ marginTop: spacing.xl, marginBottom: 12 }}>SUPPORTIVE HABITS</Label>
      <View style={{ gap: spacing.md }}>
        {HABITS.map((habit) => (
          <GlassCard key={habit.title} style={styles.habit}>
            <View style={[styles.habitIcon, { backgroundColor: habit.color + '1a' }]}>
              <Ionicons name={habit.icon} size={20} color={habit.color} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 15 }}>{habit.title}</Body>
              <Muted style={{ fontSize: 13, lineHeight: 19 }}>{habit.body}</Muted>
            </View>
          </GlassCard>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xs, marginBottom: spacing.lg },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg,
    borderRadius: radius.lg, borderWidth: 1, backgroundColor: colors.panel, overflow: 'hidden',
  },
  icon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  habit: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  habitIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
