import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../../src/components/GlassCard';
import { colors, font, spacing } from '../../../src/theme/tokens';

const WIND_DOWNS = [
  { title: 'Body release', body: 'Lie down. Starting at your toes, tighten and release each muscle group moving upward. By the time you reach your scalp, allow the whole body to be heavy.' },
  { title: '4-7-8 breath', body: 'Inhale for 4 counts. Hold for 7. Exhale slowly for 8. Repeat four times. The long exhale activates the parasympathetic nervous system.' },
  { title: 'Count backward', body: 'Begin at 300 and count backward by 3s. The arithmetic is just complex enough to prevent rumination, just simple enough to become soporific.' },
  { title: 'Name the sounds', body: 'With eyes closed, name every sound you can hear without opening your eyes. Start with the farthest, work inward. Let the sounds become a field, not individual events.' },
  { title: 'Gratitude scan', body: 'Think of three things from today you are grateful for, however small. Let each one rest in attention for three full breaths before moving to the next.' },
];

export default function SleepPractice() {
  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#07090a', '#050708']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Practices</Text>
        </Pressable>
        <Text style={styles.title}>Sleep</Text>
        <Text style={styles.sub}>Wind-down practices to prepare the body for rest.</Text>

        <View style={styles.list}>
          {WIND_DOWNS.map((w, i) => (
            <GlassCard key={i} style={styles.card}>
              <Text style={styles.cardTitle}>{w.title}</Text>
              <Text style={styles.cardBody}>{w.body}</Text>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070a' },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  back: { paddingTop: spacing.lg },
  backText: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.teal },
  title: { fontFamily: font.display, fontSize: 28, color: colors.text },
  sub: { fontFamily: font.serif, fontSize: 15, color: colors.textMuted, lineHeight: 23 },
  list: { gap: spacing.sm },
  card: { padding: spacing.xl, gap: spacing.sm },
  cardTitle: { fontFamily: font.sansBold, fontSize: 15, color: colors.text },
  cardBody: { fontFamily: font.serif, fontSize: 14, color: colors.textMuted, lineHeight: 22 },
});
