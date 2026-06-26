import React, { useRef, useState } from 'react';
import { View, StyleSheet, FlatList, useWindowDimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { BrandMark } from '../src/components/BrandMark';
import { GradientButton } from '../src/components/GradientButton';
import { Display, Body, Label } from '../src/components/ui';
import { useApp } from '../src/context/AppContext';
import { colors, radius, spacing } from '../src/theme/theme';
import { select } from '../src/lib/haptics';

interface Slide {
  kicker: string;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
}

const SLIDES: Slide[] = [
  {
    kicker: 'Welcome to MoodSignal',
    title: 'Daily clarity, in 60 seconds',
    body: 'A research-informed companion for emotional calibration. A short voice check-in, then one clear practice — never an overwhelming list.',
    icon: 'pulse',
    accent: colors.teal,
  },
  {
    kicker: 'Listen',
    title: 'Your voice is a signal',
    body: 'A 30–60 second check-in estimates energy, calmness, and stress from how you sound — analyzed privately on your device.',
    icon: 'mic',
    accent: colors.blue,
  },
  {
    kicker: 'Practice · Wisdom · Purpose',
    title: 'One wise next step',
    body: 'Your state connects to breath, stillness, loving-kindness, sound, wisdom cards, and small acts of stewardship.',
    icon: 'leaf',
    accent: colors.moss,
  },
  {
    kicker: 'The Inner Path',
    title: 'Grow through resonance',
    body: 'Daily quests, wisdom paths, mentor nudges, and skill trees help turn small meaningful actions into long-term growth.',
    icon: 'planet',
    accent: colors.lavender,
  },
  {
    kicker: '365 days of light',
    title: 'A thoughtful word, every day',
    body: 'Affirmations, quotes, and devotionals arrive as a daily notification — each opening into a beautiful space to pause and breathe.',
    icon: 'sparkles',
    accent: colors.amber,
  },
];

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList>(null);

  const last = index === SLIDES.length - 1;

  const next = async () => {
    select();
    if (last) {
      await completeOnboarding();
      router.replace('/sign-in');
    } else {
      ref.current?.scrollToIndex({ index: index + 1, animated: true });
    }
  };

  const skip = async () => {
    await completeOnboarding();
    router.replace('/sign-in');
  };

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={SLIDES[index].accent} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.top}>
          <BrandMark size={34} />
          <Pressable onPress={skip} hitSlop={10}>
            <Body color={colors.textDim}>Skip</Body>
          </Pressable>
        </View>

        <FlatList
          ref={ref}
          data={SLIDES}
          keyExtractor={(s) => s.title}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}> 
              <Animated.View entering={FadeIn.duration(500)} style={styles.iconWrap}>
                <View style={[styles.iconHalo, { backgroundColor: item.accent + '22', borderColor: item.accent + '55' }]}> 
                  <Ionicons name={item.icon} size={46} color={item.accent} />
                </View>
              </Animated.View>
              <Label color={item.accent} style={{ marginBottom: 10 }}>{item.kicker.toUpperCase()}</Label>
              <Display style={styles.title}>{item.title}</Display>
              <Body style={styles.body}>{item.body}</Body>
            </View>
          )}
        />

        <View style={styles.bottom}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === index && { width: 26, backgroundColor: SLIDES[index].accent },
                ]}
              />
            ))}
          </View>
          <GradientButton label={last ? 'Begin' : 'Continue'} onPress={next} full />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  slide: { paddingHorizontal: spacing.xl, justifyContent: 'center', flex: 1 },
  iconWrap: { marginBottom: spacing.xl },
  iconHalo: {
    width: 108, height: 108, borderRadius: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  title: { fontSize: 40, lineHeight: 46, marginBottom: spacing.md },
  body: { fontSize: 16.5, lineHeight: 26, maxWidth: 360 },
  bottom: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.lg },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.18)' },
});