import { ScrollView, View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../../src/store';
import { getEmotion } from '../../../src/content/emotions';
import { GlassCard } from '../../../src/components/GlassCard';
import { colors, font, spacing } from '../../../src/theme/tokens';

export default function InsightsIndex() {
  const recentCheckIns = useStore((s) => s.recentCheckIns);

  const last7 = recentCheckIns.filter((c) => Date.now() - c.at < 7 * 86400000);
  const last30 = recentCheckIns.filter((c) => Date.now() - c.at < 30 * 86400000);

  const avgValence7 = last7.length > 0
    ? last7.reduce((s, c) => s + c.valence, 0) / last7.length
    : null;

  const emotionCounts: Record<string, number> = {};
  last30.forEach((c) => { emotionCounts[c.emotion] = (emotionCounts[c.emotion] ?? 0) + 1; });
  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, count]) => ({ emotion: getEmotion(id), count }));

  const streak = computeStreak(recentCheckIns.map((c) => c.at));

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Dashboard</Text>
        </Pressable>
        <Text style={styles.title}>Insights</Text>

        <View style={styles.stats}>
          <StatCard label="Check-in streak" value={`${streak} days`} color={colors.teal} />
          <StatCard label="Check-ins (30d)" value={String(last30.length)} color={colors.amber} />
          {avgValence7 !== null && (
            <StatCard
              label="Mood avg (7d)"
              value={avgValence7 > 0.2 ? 'Positive' : avgValence7 < -0.2 ? 'Low' : 'Neutral'}
              color={avgValence7 > 0 ? colors.moss : colors.coral}
            />
          )}
        </View>

        {topEmotions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Most frequent (30 days)</Text>
            <View style={styles.emotionList}>
              {topEmotions.map(({ emotion, count }) => (
                <GlassCard key={emotion.id} style={styles.emotionCard}>
                  <View style={[styles.dot, { backgroundColor: emotion.color }]} />
                  <View style={styles.emotionText}>
                    <Text style={styles.emotionName}>{emotion.label}</Text>
                    <Text style={styles.emotionCount}>{count} {count === 1 ? 'time' : 'times'}</Text>
                  </View>
                </GlassCard>
              ))}
            </View>
          </>
        )}

        {recentCheckIns.length === 0 && (
          <Text style={styles.empty}>Complete daily check-ins to see your patterns here.</Text>
        )}

        {last7.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Last 7 days</Text>
            <View style={styles.historyList}>
              {last7.map((c) => {
                const e = getEmotion(c.emotion);
                return (
                  <View key={c.id} style={styles.historyRow}>
                    <View style={[styles.histDot, { backgroundColor: e.color }]} />
                    <Text style={styles.histDate}>{new Date(c.at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                    <Text style={styles.histEmotion}>{e.label}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <GlassCard style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </GlassCard>
  );
}

function computeStreak(timestamps: number[]): number {
  if (timestamps.length === 0) return 0;
  const days = new Set(timestamps.map((t) => {
    const d = new Date(t);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }));
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (days.has(key)) streak++;
    else break;
  }
  return streak;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  back: { paddingTop: spacing.lg },
  backText: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.teal },
  title: { fontFamily: font.display, fontSize: 28, color: colors.text },
  stats: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, padding: spacing.lg, gap: spacing.xs },
  statLabel: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint },
  statValue: { fontFamily: font.displayBold, fontSize: 18 },
  sectionTitle: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.textFaint, letterSpacing: 1.2, textTransform: 'uppercase' },
  emotionList: { gap: spacing.xs },
  emotionCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  dot: { width: 10, height: 10, borderRadius: 5 },
  emotionText: { gap: 2 },
  emotionName: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.text },
  emotionCount: { fontFamily: font.sans, fontSize: 12, color: colors.textFaint },
  empty: { fontFamily: font.serif, fontSize: 15, color: colors.textFaint },
  historyList: { gap: spacing.xs },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  histDot: { width: 8, height: 8, borderRadius: 4 },
  histDate: { fontFamily: font.sans, fontSize: 12, color: colors.textFaint, width: 110 },
  histEmotion: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.text },
});
