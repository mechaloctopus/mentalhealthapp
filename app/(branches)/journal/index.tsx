import { ScrollView, View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../../src/store';
import { GlassCard } from '../../../src/components/GlassCard';
import { colors, font, spacing } from '../../../src/theme/tokens';

export default function JournalIndex() {
  const entries = useStore((s) => s.recentEntries);

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Dashboard</Text>
        </Pressable>
        <Text style={styles.title}>Journal</Text>

        <View style={styles.actions}>
          <Pressable onPress={() => router.push('/(branches)/journal/write')} style={styles.actionBtn}>
            <Text style={styles.actionEmoji}>✏️</Text>
            <Text style={styles.actionLabel}>Free write</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(branches)/journal/reflect')} style={styles.actionBtn}>
            <Text style={styles.actionEmoji}>◈</Text>
            <Text style={styles.actionLabel}>Guided reflect</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Recent entries</Text>
        {entries.length === 0 ? (
          <Text style={styles.empty}>Your entries will appear here.</Text>
        ) : (
          <View style={styles.list}>
            {entries.map((e) => (
              <GlassCard key={e.id} style={styles.entry}>
                <Text style={styles.entryDate}>{new Date(e.at).toLocaleDateString()}</Text>
                <Text style={styles.entryBody} numberOfLines={3}>{e.body}</Text>
              </GlassCard>
            ))}
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
  title: { fontFamily: font.display, fontSize: 28, color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    flex: 1, backgroundColor: colors.panel, borderRadius: 18,
    borderWidth: 1, borderColor: colors.panelBorder,
    padding: spacing.xl, alignItems: 'center', gap: spacing.sm,
  },
  actionEmoji: { fontSize: 28 },
  actionLabel: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.teal },
  sectionTitle: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.textFaint, letterSpacing: 1.2, textTransform: 'uppercase' },
  empty: { fontFamily: font.serif, fontSize: 15, color: colors.textFaint },
  list: { gap: spacing.sm },
  entry: { padding: spacing.xl, gap: spacing.xs },
  entryDate: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.textFaint },
  entryBody: { fontFamily: font.serif, fontSize: 14, color: colors.textMuted, lineHeight: 22 },
});
