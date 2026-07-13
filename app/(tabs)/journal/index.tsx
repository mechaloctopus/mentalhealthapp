import { ScrollView, View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../../src/store';
import { GlassCard } from '../../../src/components/GlassCard';
import { colors, font, spacing } from '../../../src/theme/tokens';

export default function JournalTab() {
  const entries = useStore((s) => s.recentEntries);

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Journal</Text>

        <View style={styles.actions}>
          <Pressable onPress={() => router.push('/(tabs)/journal/write')} style={styles.actionBtn}>
            <Text style={styles.actionGlyph}>✏</Text>
            <Text style={styles.actionLabel}>Free write</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/journal/reflect')} style={styles.actionBtn}>
            <Text style={styles.actionGlyph}>◈</Text>
            <Text style={styles.actionLabel}>Reflect</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/journal/gratitude')} style={styles.actionBtn}>
            <Text style={styles.actionGlyph}>♡</Text>
            <Text style={styles.actionLabel}>Gratitude</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Recent entries</Text>
        {entries.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyGlyph}>◈</Text>
            <Text style={styles.emptyText}>Your entries will appear here.</Text>
            <Text style={styles.emptySub}>Write something to begin.</Text>
          </GlassCard>
        ) : (
          <View style={styles.list}>
            {entries.map((e) => (
              <Pressable key={e.id} onPress={() => router.push({ pathname: '/(tabs)/journal/view', params: { id: e.id } })}>
                <GlassCard style={styles.entry}>
                  <View style={styles.entryMeta}>
                    <Text style={styles.entryDate}>{new Date(e.at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                    <Text style={styles.entryType}>{e.type}</Text>
                  </View>
                  <Text style={styles.entryBody} numberOfLines={3}>{e.body}</Text>
                  <Text style={styles.entryArrow}>›</Text>
                </GlassCard>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  title: { fontFamily: font.display, fontSize: 28, color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    flex: 1, backgroundColor: colors.panel, borderRadius: 18,
    borderWidth: 1, borderColor: colors.panelBorder,
    padding: spacing.lg, alignItems: 'center', gap: spacing.xs,
  },
  actionGlyph: { fontSize: 22, color: colors.teal },
  actionLabel: { fontFamily: font.sansSemibold, fontSize: 12, color: colors.teal },
  sectionTitle: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.textFaint, letterSpacing: 1.2, textTransform: 'uppercase' },
  emptyCard: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  emptyGlyph: { fontSize: 32, color: colors.textFaint },
  emptyText: { fontFamily: font.serif, fontSize: 16, color: colors.textMuted },
  emptySub: { fontFamily: font.sans, fontSize: 13, color: colors.textFaint },
  list: { gap: spacing.sm },
  entry: { padding: spacing.xl, gap: spacing.sm },
  entryMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryDate: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.textFaint },
  entryType: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: 0.8 },
  entryBody: { fontFamily: font.serif, fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  entryArrow: { fontFamily: font.sans, fontSize: 18, color: colors.textFaint, textAlign: 'right' },
});
