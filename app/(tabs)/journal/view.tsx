import { ScrollView, View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../../src/store';
import { GlassCard } from '../../../src/components/GlassCard';
import { colors, font, spacing } from '../../../src/theme/tokens';

const TYPE_LABELS: Record<string, string> = {
  free: 'Free write',
  reflect: 'Guided reflect',
  gratitude: 'Gratitude',
};

export default function JournalView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entries = useStore((s) => s.recentEntries);
  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <SafeAreaView style={styles.root}>
        <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
        <View style={styles.notFound}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>‹ Journal</Text>
          </Pressable>
          <Text style={styles.notFoundText}>Entry not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Journal</Text>
        </Pressable>

        <View style={styles.meta}>
          <Text style={styles.typeLabel}>{TYPE_LABELS[entry.type] ?? entry.type}</Text>
          <Text style={styles.dateLabel}>
            {new Date(entry.at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {entry.prompt && (
          <GlassCard style={styles.promptCard}>
            <Text style={styles.promptLabel}>Prompt</Text>
            <Text style={styles.promptText}>{entry.prompt}</Text>
          </GlassCard>
        )}

        <GlassCard strong style={styles.bodyCard}>
          <Text style={styles.bodyText}>{entry.body}</Text>
        </GlassCard>

        {entry.emotion && (
          <View style={styles.emotionRow}>
            <Text style={styles.emotionLabel}>Mood when written</Text>
            <Text style={styles.emotionValue}>{entry.emotion}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  back: { paddingTop: spacing.lg },
  backText: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.teal },
  meta: { gap: spacing.xs },
  typeLabel: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.textFaint, letterSpacing: 1.2, textTransform: 'uppercase' },
  dateLabel: { fontFamily: font.display, fontSize: 22, color: colors.text },
  promptCard: { padding: spacing.xl, gap: spacing.xs },
  promptLabel: { fontFamily: font.sansSemibold, fontSize: 10, color: colors.amber, letterSpacing: 1.2, textTransform: 'uppercase' },
  promptText: { fontFamily: font.serif, fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  bodyCard: { padding: spacing.xl },
  bodyText: { fontFamily: font.serif, fontSize: 17, color: colors.text, lineHeight: 28 },
  emotionRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  emotionLabel: { fontFamily: font.sans, fontSize: 12, color: colors.textFaint },
  emotionValue: { fontFamily: font.sansSemibold, fontSize: 12, color: colors.teal, textTransform: 'capitalize' },
  notFound: { flex: 1, padding: spacing.lg, gap: spacing.xl },
  notFoundText: { fontFamily: font.serif, fontSize: 16, color: colors.textMuted },
});
