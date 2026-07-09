import { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../src/store';
import { GlassCard } from '../../src/components/GlassCard';
import { colors, font, spacing, gradients } from '../../src/theme/tokens';

const EMOTION_COLORS: Record<string, string> = {
  serene: colors.teal,
  content: colors.moss,
  joyful: colors.amber,
  excited: colors.coral,
  anxious: colors.lavender,
  angry: colors.coral,
  sad: colors.blue,
  fearful: colors.indigo,
  neutral: colors.textDim,
};

const PLOT_SIZE = 260;
const DOT_SIZE = 10;

function emotionColor(emotion: string): string {
  return EMOTION_COLORS[emotion.toLowerCase()] ?? colors.textFaint;
}

function valenceToX(valence: number): number {
  return ((valence / 100) * (PLOT_SIZE - DOT_SIZE * 2)) + DOT_SIZE;
}

function arousalToY(arousal: number): number {
  return ((1 - arousal / 100) * (PLOT_SIZE - DOT_SIZE * 2)) + DOT_SIZE;
}

function toDateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function SignalTab() {
  const recentCheckIns = useStore((s) => s.recentCheckIns);
  const streak = useStore((s) => s.streak);

  const last30 = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return recentCheckIns.filter((c) => c.at >= cutoff);
  }, [recentCheckIns]);

  const calendarDays = useMemo(() => {
    const days: { key: string; emotion: string | null; isToday: boolean }[] = [];
    const byDay: Record<string, string> = {};
    last30.forEach((c) => { byDay[toDateKey(c.at)] = c.emotion; });
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toDateKey(d.getTime());
      days.push({ key, emotion: byDay[key] ?? null, isToday: i === 0 });
    }
    return days;
  }, [last30]);

  const insights = useMemo(() => {
    if (last30.length === 0) return [];
    const counts: Record<string, number> = {};
    last30.forEach((c) => { counts[c.emotion] = (counts[c.emotion] ?? 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const dominant = sorted[0];
    const avgValence = last30.reduce((a, c) => a + c.valence, 0) / last30.length;
    const avgArousal = last30.reduce((a, c) => a + c.arousal, 0) / last30.length;
    const ins: string[] = [];
    if (dominant) {
      ins.push(`Most frequent mood: ${dominant[0]} (${dominant[1]} ${dominant[1] === 1 ? 'time' : 'times'})`);
    }
    if (avgValence >= 55) ins.push('Your overall valence is positive — more pleasant than difficult.');
    else if (avgValence <= 45) ins.push('Your overall valence has been lower — the signal is being honest.');
    else ins.push('Your valence has been balanced — neither strongly pleasant nor difficult.');
    if (avgArousal >= 55) ins.push('You\'ve been running high energy over the past month.');
    else if (avgArousal <= 45) ins.push('Your energy has been calmer and more settled.');
    return ins;
  }, [last30]);

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[...gradients.canvas]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Signal</Text>

        {streak > 0 && (
          <GlassCard style={styles.streakCard}>
            <Text style={styles.streakGlyph}>✦</Text>
            <View style={styles.streakText}>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>{streak === 1 ? 'day' : 'days'} in a row</Text>
            </View>
            <Text style={styles.streakDesc}>The signal is continuous.</Text>
          </GlassCard>
        )}

        {last30.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Constellation — 30 days</Text>
            <GlassCard style={styles.plotCard}>
              <View style={styles.axisLabels}>
                <Text style={styles.axisLabelTop}>High energy</Text>
              </View>
              <View style={styles.plotArea}>
                <View style={styles.axisV}>
                  <Text style={styles.axisTickLabel}>Difficult</Text>
                  <Text style={styles.axisTickLabel}>Pleasant</Text>
                </View>
                <View style={[styles.plotContainer, { width: PLOT_SIZE, height: PLOT_SIZE }]}>
                  {/* Quadrant lines */}
                  <View style={[styles.axisLineH, { top: PLOT_SIZE / 2 }]} />
                  <View style={[styles.axisLineV, { left: PLOT_SIZE / 2 }]} />
                  {last30.map((c, i) => (
                    <View
                      key={`${c.id ?? i}`}
                      style={[
                        styles.dot,
                        {
                          left: valenceToX(c.valence) - DOT_SIZE / 2,
                          top: arousalToY(c.arousal) - DOT_SIZE / 2,
                          backgroundColor: emotionColor(c.emotion),
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.axisLabelBottom}>Low energy</Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>30-day calendar</Text>
            <GlassCard style={styles.calendarCard}>
              <View style={styles.calendarGrid}>
                {calendarDays.map((d) => (
                  <View
                    key={d.key}
                    style={[
                      styles.calDay,
                      d.emotion ? { backgroundColor: emotionColor(d.emotion), opacity: 0.85 } : styles.calDayEmpty,
                      d.isToday && styles.calDayToday,
                    ]}
                  />
                ))}
              </View>
              <View style={styles.calLegend}>
                {Object.entries(EMOTION_COLORS).slice(0, 5).map(([emotion, color]) => (
                  <View key={emotion} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: color }]} />
                    <Text style={styles.legendLabel}>{emotion}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>

            {insights.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Patterns</Text>
                <View style={styles.insightsList}>
                  {insights.map((ins, i) => (
                    <GlassCard key={i} style={styles.insightCard}>
                      <Text style={styles.insightGlyph}>≋</Text>
                      <Text style={styles.insightText}>{ins}</Text>
                    </GlassCard>
                  ))}
                </View>
              </>
            )}
          </>
        ) : (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyGlyph}>≋</Text>
            <Text style={styles.emptyTitle}>The map is forming</Text>
            <Text style={styles.emptySub}>
              Check in daily and your signal constellation will appear here after a few days.
            </Text>
          </GlassCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  title: { fontFamily: font.display, fontSize: 28, color: colors.text },
  sectionTitle: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.textFaint, letterSpacing: 1.2, textTransform: 'uppercase' },

  streakCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  streakGlyph: { fontSize: 24, color: colors.amber },
  streakText: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  streakNumber: { fontFamily: font.displayBold, fontSize: 28, color: colors.amber },
  streakLabel: { fontFamily: font.sans, fontSize: 13, color: colors.textMuted },
  streakDesc: { fontFamily: font.serif, fontSize: 13, color: colors.textFaint, flex: 1, textAlign: 'right' },

  plotCard: { padding: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  axisLabels: { alignItems: 'center' },
  axisLabelTop: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint, letterSpacing: 0.5 },
  axisLabelBottom: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint, letterSpacing: 0.5 },
  plotArea: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  axisV: { gap: PLOT_SIZE - 24, alignItems: 'flex-end' },
  axisTickLabel: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint, letterSpacing: 0.5 },
  plotContainer: { position: 'relative', backgroundColor: colors.surface1, borderRadius: 12, overflow: 'hidden' },
  axisLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.hairline },
  axisLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: colors.hairline },
  dot: { position: 'absolute', width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2 },

  calendarCard: { padding: spacing.lg, gap: spacing.md },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  calDay: { width: 16, height: 16, borderRadius: 4 },
  calDayEmpty: { backgroundColor: colors.surface2 },
  calDayToday: { borderWidth: 1.5, borderColor: colors.teal },
  calLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint },

  insightsList: { gap: spacing.sm },
  insightCard: { flexDirection: 'row', gap: spacing.md, padding: spacing.xl, alignItems: 'flex-start' },
  insightGlyph: { fontSize: 16, color: colors.teal, marginTop: 2 },
  insightText: { flex: 1, fontFamily: font.serif, fontSize: 14, color: colors.textMuted, lineHeight: 22 },

  emptyCard: { padding: spacing.xl, alignItems: 'center', gap: spacing.md, marginTop: spacing.xxl },
  emptyGlyph: { fontSize: 40, color: colors.textFaint },
  emptyTitle: { fontFamily: font.display, fontSize: 20, color: colors.text },
  emptySub: { fontFamily: font.serif, fontSize: 14, color: colors.textFaint, textAlign: 'center', lineHeight: 22 },
});
