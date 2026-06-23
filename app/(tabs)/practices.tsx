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
  { title: 'Breath', subtitle: 'Guided paced breathing for the nervous system', icon: 'leaf', route: '/breath', color: colors.teal, meta: '4–60 min' },
  { title: 'Perfect Stillness', subtitle: 'A slow body scan — observation before story', icon: 'moon', route: '/stillness', color: colors.blue, meta: '8 min' },
  { title: 'Loving-kindness', subtitle: 'Meta meditation: forgiveness and goodwill', icon: 'heart', route: '/meta', color: colors.coral, meta: '6 min' },
  { title: 'Sound', subtitle: 'Frequency-assisted relaxation & ambient tones', icon: 'musical-notes', route: '/sound', color: colors.lavender, meta: 'Presets' },
];

const HABITS = [
  { title: 'Monthly fasting reset', body: 'One optional gentle day a month — hydrate, keep quiet, refeed softly. Not for everyone; safety first.', icon: 'restaurant-outline' as const, color: colors.moss },
  { title: 'Sleep & screen time', body: 'A dark, cool, quiet bedroom. Charge the phone outside the room. Small changes, deeper rest.', icon: 'bed-outline' as const, color: colors.amber },
];

export default function Practices() {
  const router = useRouter();
  return (
    <Screen tint={colors.moss}>
      <View style={styles.header}>
        <Display style={{ fontSize: 32 }}>Practices</Display>
        <Muted style={{ marginTop: 4 }}>Ancient attention, modern nervous-system support.</Muted>
      </View>

      <View style={{ gap: spacing.md }}>
        {PRACTICES.map((p, i) => (
          <Animated.View key={p.title} entering={FadeInDown.delay(i * 70).duration(500)}>
            <Pressable onPress={() => { tap(); router.push(p.route as any); }}>
              <View style={[styles.card, { borderColor: p.color + '40' }]}>
                <LinearGradient colors={[p.color + '1c', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                <View style={[styles.icon, { backgroundColor: p.color + '22', borderColor: p.color + '55' }]}>
                  <Ionicons name={p.icon} size={24} color={p.color} />
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Serif style={{ fontSize: 20 }}>{p.title}</Serif>
                  <Body style={{ fontSize: 13.5 }}>{p.subtitle}</Body>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <Muted style={{ fontSize: 11.5, color: p.color }}>{p.meta}</Muted>
                  <Ionicons name="arrow-forward" size={18} color={colors.textDim} />
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      <Label style={{ marginTop: spacing.xl, marginBottom: 12 }}>SUPPORTIVE HABITS</Label>
      <View style={{ gap: spacing.md }}>
        {HABITS.map((h) => (
          <GlassCard key={h.title} style={styles.habit}>
            <View style={[styles.habitIcon, { backgroundColor: h.color + '1a' }]}>
              <Ionicons name={h.icon} size={20} color={h.color} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 15 }}>{h.title}</Body>
              <Muted style={{ fontSize: 13, lineHeight: 19 }}>{h.body}</Muted>
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
