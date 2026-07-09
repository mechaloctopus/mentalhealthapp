import { useMemo } from 'react';
import {
  ScrollView, View, Text, StyleSheet, SafeAreaView,
} from 'react-native';
import Svg, { Polyline, Path, Line, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../src/store';
import { GlassCard } from '../../src/components/GlassCard';
import { VocalRadar, buildRadarData } from '../../src/components/VocalRadar';
import { colors, font, spacing, gradients, radius } from '../../src/theme/tokens';
import type { CheckIn } from '../../src/engine/voice';

// ── Palette ────────────────────────────────────────────────────────────────

const EMOTION_COLORS: Record<string, string> = {
  serene:   colors.teal,
  content:  colors.moss,
  joyful:   colors.amber,
  excited:  colors.coral,
  anxious:  colors.lavender,
  angry:    colors.coral,
  sad:      colors.blue,
  fearful:  colors.indigo,
  neutral:  colors.textDim,
};

function emotionColor(emotion: string): string {
  return EMOTION_COLORS[emotion.toLowerCase()] ?? colors.textFaint;
}

// ── Scatter plot ───────────────────────────────────────────────────────────

const PLOT_SIZE = 256;
const DOT_SIZE = 10;

function valenceToX(v: number): number {
  // v: -1..1 → 0..PLOT_SIZE
  return ((v + 1) / 2) * (PLOT_SIZE - DOT_SIZE * 2) + DOT_SIZE;
}
function arousalToY(a: number): number {
  // a: -1..1 → PLOT_SIZE..0 (inverted; high arousal = top)
  return (1 - (a + 1) / 2) * (PLOT_SIZE - DOT_SIZE * 2) + DOT_SIZE;
}

// ── Calendar ───────────────────────────────────────────────────────────────

function toDateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// ── Sparkline helpers ──────────────────────────────────────────────────────

function sparkPath(values: number[], min: number, max: number, w: number, h: number): string {
  if (values.length < 2) return '';
  const range = max - min || 0.01;
  const pad = h * 0.1;
  return values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

// ── Biomarker cards ────────────────────────────────────────────────────────

const BIOMARKERS = [
  {
    code: 'F-01', name: 'Energy', color: colors.amber,
    get: (c: CheckIn) => c.energy,
    desc: 'Amplitude mean + speech rate',
    interp: (v: number) => v > 65 ? 'High' : v < 35 ? 'Low' : 'Mid',
  },
  {
    code: 'F-02', name: 'Calmness', color: colors.teal,
    get: (c: CheckIn) => c.calmness,
    desc: 'Signal smoothness + rhythm',
    interp: (v: number) => v > 65 ? 'Calm' : v < 35 ? 'Tense' : 'Neutral',
  },
  {
    code: 'F-03', name: 'Stability', color: colors.blue,
    get: (c: CheckIn) => c.stability,
    desc: 'Variance + amplitude center',
    interp: (v: number) => v > 65 ? 'Steady' : v < 35 ? 'Variable' : 'Moderate',
  },
  {
    code: 'F-04', name: 'Coherence', color: colors.violet,
    get: (c: CheckIn) => c.voiceFeatures?.voiceCoherence ?? null,
    desc: 'Lag-3 autocorrelation',
    interp: (v: number) => v > 65 ? 'Periodic' : v < 35 ? 'Irregular' : 'Normal',
  },
  {
    code: 'F-05', name: 'Burst', color: colors.coral,
    get: (c: CheckIn) => c.voiceFeatures?.burstRegularity ?? null,
    desc: 'Speech burst regularity',
    interp: (v: number) => v > 65 ? 'Regular' : v < 35 ? 'Scattered' : 'Mixed',
  },
  {
    code: 'F-06', name: 'Entropy', color: colors.lavender,
    get: (c: CheckIn) => c.voiceFeatures?.temporalEntropy ?? null,
    desc: 'Loudness distribution spread',
    interp: (v: number) => v > 65 ? 'Expressive' : v < 35 ? 'Monotone' : 'Balanced',
  },
] as const;

// ── Component ──────────────────────────────────────────────────────────────

const SPARK_W = 140;
const SPARK_H = 40;

export default function SignalTab() {
  const recentCheckIns = useStore((s) => s.recentCheckIns);
  const todayCheckIn   = useStore((s) => s.todayCheckIn);
  const baseline       = useStore((s) => s.baseline);
  const streak         = useStore((s) => s.streak);

  const last30 = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return [...recentCheckIns.filter((c) => c.at >= cutoff)].reverse(); // chronological
  }, [recentCheckIns]);

  const last30Desc = useMemo(() => [...last30].reverse(), [last30]);

  // Calendar
  const calendarDays = useMemo(() => {
    const byDay: Record<string, string> = {};
    last30.forEach((c) => { byDay[toDateKey(c.at)] = c.emotion; });
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = toDateKey(d.getTime());
      return { key, emotion: byDay[key] ?? null, isToday: i === 29 };
    });
  }, [last30]);

  // Patterns
  const insights = useMemo(() => {
    if (last30.length === 0) return [];
    const counts: Record<string, number> = {};
    last30.forEach((c) => { counts[c.emotion] = (counts[c.emotion] ?? 0) + 1; });
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const avgValence = last30.reduce((a, c) => a + c.valence, 0) / last30.length;
    const avgArousal = last30.reduce((a, c) => a + c.arousal, 0) / last30.length;
    const ins: string[] = [];
    if (dominant) ins.push(`Most frequent: ${dominant[0]} (${dominant[1]}×)`);
    if (avgValence >= 0.1) ins.push('Overall valence is positive — more pleasant than difficult.');
    else if (avgValence <= -0.1) ins.push('Overall valence has been lower — the signal is honest.');
    else ins.push('Valence has been balanced — neither strongly pleasant nor difficult.');
    if (avgArousal >= 0.15) ins.push('Running high energy over the past month.');
    else if (avgArousal <= -0.15) ins.push('Energy has been calmer and more settled.');
    return ins;
  }, [last30]);

  // Sparkline data
  const valenceValues = last30.map((c) => c.valence);
  const arousalValues = last30.map((c) => c.arousal);
  const vMin = -1; const vMax = 1;

  // Radar data
  const radarToday = todayCheckIn
    ? buildRadarData(todayCheckIn, todayCheckIn.voiceFeatures)
    : null;
  const radarBaseline = baseline
    ? buildRadarData(baseline, baseline.voiceFeatures)
    : null;

  // Avg stats for biomarker section
  const voiceCheckins = last30.filter((c) => c.source === 'voice');

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[...gradients.canvas]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Signal Lab</Text>
          <Text style={styles.titleGlyph}>≋</Text>
        </View>

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

        {/* ── Voice Profile ── */}
        {radarToday && (
          <>
            <Text style={styles.sectionTitle}>Today's Voice Profile</Text>
            <GlassCard style={styles.radarCard}>
              <View style={styles.radarRow}>
                <VocalRadar today={radarToday} baseline={radarBaseline} size={200} />
                <View style={styles.radarMeta}>
                  {radarBaseline && (
                    <View style={styles.legendRow}>
                      <View style={[styles.legendLine, { borderColor: colors.violet }]} />
                      <Text style={styles.legendText}>Today</Text>
                    </View>
                  )}
                  {radarBaseline && (
                    <View style={styles.legendRow}>
                      <View style={[styles.legendLine, { borderColor: colors.teal, borderStyle: 'dashed' }]} />
                      <Text style={styles.legendText}>Baseline</Text>
                    </View>
                  )}
                  {todayCheckIn?.voiceFeatures && (
                    <>
                      <View style={styles.miniStatDivider} />
                      <MiniStat label="Shimmer" value={todayCheckIn.voiceFeatures.shimmer} />
                      <MiniStat label="Entropy" value={todayCheckIn.voiceFeatures.temporalEntropy} />
                      <MiniStat label="Pause" value={todayCheckIn.voiceFeatures.pauseIndex} />
                    </>
                  )}
                </View>
              </View>
            </GlassCard>
          </>
        )}

        {/* ── Biomarker cards ── */}
        {last30.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Acoustic Biomarkers</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              style={styles.bioScroll} contentContainerStyle={styles.bioScrollContent}>
              {BIOMARKERS.map((bm) => {
                const todayVal = todayCheckIn ? bm.get(todayCheckIn) : null;
                const avgVal = voiceCheckins.length > 0
                  ? voiceCheckins.reduce((s, c) => s + (bm.get(c) ?? 50), 0) / voiceCheckins.length
                  : null;
                return (
                  <View key={bm.code} style={styles.bioCard}>
                    <Text style={[styles.bioCode, { color: bm.color }]}>{bm.code}</Text>
                    <Text style={styles.bioName}>{bm.name}</Text>
                    <Text style={styles.bioDesc}>{bm.desc}</Text>
                    {todayVal !== null ? (
                      <>
                        <View style={styles.bioBarTrack}>
                          <View style={[styles.bioBarFill, {
                            width: `${todayVal}%` as any,
                            backgroundColor: bm.color,
                          }]} />
                        </View>
                        <Text style={[styles.bioValue, { color: bm.color }]}>
                          {bm.interp(todayVal)} · {Math.round(todayVal)}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.bioEmpty}>voice only</Text>
                    )}
                    {avgVal !== null && (
                      <Text style={styles.bio30avg}>30d avg: {Math.round(avgVal)}</Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* ── 30-day trend ── */}
        {last30.length >= 3 && (
          <>
            <Text style={styles.sectionTitle}>30-Day Trend</Text>
            <GlassCard style={styles.trendCard}>
              <View style={styles.trendRow}>
                <TrendSparkline
                  values={valenceValues} min={vMin} max={vMax}
                  color={colors.teal} label="Valence"
                />
                <View style={styles.trendDivider} />
                <TrendSparkline
                  values={arousalValues} min={vMin} max={vMax}
                  color={colors.coral} label="Arousal"
                />
              </View>
            </GlassCard>
          </>
        )}

        {/* ── Constellation scatter plot ── */}
        {last30Desc.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Constellation — 30 days</Text>
            <GlassCard style={styles.plotCard}>
              <Text style={styles.axisLabelTop}>High energy</Text>
              <View style={styles.plotRow}>
                <View style={styles.axisV}>
                  <Text style={styles.axisTickLabel}>Difficult</Text>
                  <Text style={styles.axisTickLabel}>Pleasant</Text>
                </View>
                <View style={[styles.plotContainer, { width: PLOT_SIZE, height: PLOT_SIZE }]}>
                  <View style={[styles.axisLineH, { top: PLOT_SIZE / 2 }]} />
                  <View style={[styles.axisLineV, { left: PLOT_SIZE / 2 }]} />
                  {last30Desc.map((c, i) => (
                    <View key={`${c.id ?? i}`} style={[styles.dot, {
                      left: valenceToX(c.valence) - DOT_SIZE / 2,
                      top: arousalToY(c.arousal) - DOT_SIZE / 2,
                      backgroundColor: emotionColor(c.emotion),
                      opacity: 0.6 + (i / last30Desc.length) * 0.4,
                    }]} />
                  ))}
                  {/* Mark today's check-in */}
                  {todayCheckIn && (
                    <View style={[styles.dot, styles.dotToday, {
                      left: valenceToX(todayCheckIn.valence) - DOT_SIZE / 2,
                      top: arousalToY(todayCheckIn.arousal) - DOT_SIZE / 2,
                    }]} />
                  )}
                </View>
              </View>
              <Text style={styles.axisLabelBottom}>Low energy</Text>
            </GlassCard>
          </>
        )}

        {/* ── Calendar ── */}
        {last30.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>30-day calendar</Text>
            <GlassCard style={styles.calendarCard}>
              <View style={styles.calendarGrid}>
                {calendarDays.map((d) => (
                  <View key={d.key} style={[
                    styles.calDay,
                    d.emotion
                      ? { backgroundColor: emotionColor(d.emotion), opacity: 0.8 }
                      : styles.calDayEmpty,
                    d.isToday && styles.calDayToday,
                  ]} />
                ))}
              </View>
              <View style={styles.calLegend}>
                {Object.entries(EMOTION_COLORS).slice(0, 6).map(([emotion, color]) => (
                  <View key={emotion} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: color }]} />
                    <Text style={styles.legendLabel}>{emotion}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </>
        )}

        {/* ── Patterns ── */}
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

        {/* ── Empty state ── */}
        {last30.length === 0 && (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyGlyph}>≋</Text>
            <Text style={styles.emptyTitle}>The map is forming</Text>
            <Text style={styles.emptySub}>
              Check in daily and your signal constellation will appear here.
            </Text>
          </GlassCard>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatValue}>{Math.round(value)}</Text>
    </View>
  );
}

function TrendSparkline({
  values, min, max, color, label,
}: { values: number[]; min: number; max: number; color: string; label: string }) {
  const d = sparkPath(values, min, max, SPARK_W, SPARK_H);
  const midY = (SPARK_H * 0.5).toFixed(1);
  return (
    <View style={styles.sparklineWrap}>
      <Text style={[styles.sparkLabel, { color }]}>{label}</Text>
      <Svg width={SPARK_W} height={SPARK_H}>
        {/* Neutral zero line */}
        <Line x1={0} y1={midY} x2={SPARK_W} y2={midY}
          stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        {d !== '' && (
          <Path d={d} fill="none" stroke={color} strokeWidth={1.5}
            strokeLinecap="round" strokeLinejoin="round" />
        )}
        {/* Latest point */}
        {values.length > 0 && (() => {
          const range = max - min || 0.01;
          const pad = SPARK_H * 0.1;
          const last = values[values.length - 1]!;
          const lx = SPARK_W;
          const ly = SPARK_H - pad - ((last - min) / range) * (SPARK_H - pad * 2);
          return <Circle cx={lx} cy={ly} r={3} fill={color} />;
        })()}
      </Svg>
      {values.length > 0 && (
        <Text style={[styles.sparkValue, { color }]}>
          {(values[values.length - 1]! >= 0 ? '+' : '')}{values[values.length - 1]!.toFixed(2)}
        </Text>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },

  header: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  title: { fontFamily: font.display, fontSize: 28, color: colors.text },
  titleGlyph: { fontFamily: font.sans, fontSize: 18, color: colors.teal, marginLeft: 'auto' as any },

  sectionTitle: {
    fontFamily: font.sansSemibold, fontSize: 11,
    color: colors.textFaint, letterSpacing: 1.2, textTransform: 'uppercase',
    marginTop: spacing.sm,
  },

  // Streak
  streakCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  streakGlyph: { fontSize: 24, color: colors.amber },
  streakText: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  streakNumber: { fontFamily: font.displayBold, fontSize: 28, color: colors.amber },
  streakLabel: { fontFamily: font.sans, fontSize: 13, color: colors.textMuted },
  streakDesc: { fontFamily: font.serif, fontSize: 13, color: colors.textFaint, flex: 1, textAlign: 'right' },

  // Radar
  radarCard: { padding: spacing.lg, gap: spacing.sm },
  radarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  radarMeta: { flex: 1, gap: spacing.sm },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendLine: { width: 18, height: 0, borderTopWidth: 2, borderRadius: 1 },
  legendText: { fontFamily: font.sans, fontSize: 11, color: colors.textFaint },
  miniStatDivider: { height: 1, backgroundColor: colors.hairline, marginVertical: spacing.xs },
  miniStat: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miniStatLabel: { fontFamily: font.sans, fontSize: 11, color: colors.textFaint },
  miniStatValue: { fontFamily: font.sansBold, fontSize: 12, color: colors.textMuted },

  // Biomarkers
  bioScroll: { marginHorizontal: -spacing.lg },
  bioScrollContent: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingRight: spacing.xl },
  bioCard: {
    width: 130, padding: spacing.md,
    backgroundColor: colors.panel, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.panelBorder,
    gap: 6,
  },
  bioCode: { fontFamily: font.sansBold, fontSize: 10, letterSpacing: 1 },
  bioName: { fontFamily: font.display, fontSize: 16, color: colors.text },
  bioDesc: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint, lineHeight: 15 },
  bioBarTrack: {
    height: 4, backgroundColor: colors.surface2,
    borderRadius: 2, overflow: 'hidden',
  },
  bioBarFill: { height: '100%', borderRadius: 2 },
  bioValue: { fontFamily: font.sansBold, fontSize: 11 },
  bioEmpty: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint, fontStyle: 'italic' },
  bio30avg: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint },

  // Trend sparklines
  trendCard: { padding: spacing.lg },
  trendRow: { flexDirection: 'row', alignItems: 'flex-start' },
  trendDivider: { width: 1, backgroundColor: colors.hairline, marginHorizontal: spacing.md, alignSelf: 'stretch' },
  sparklineWrap: { flex: 1, gap: 6 },
  sparkLabel: { fontFamily: font.sansSemibold, fontSize: 10, letterSpacing: 0.6 },
  sparkValue: { fontFamily: font.sansBold, fontSize: 11 },

  // Scatter plot
  plotCard: { padding: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  axisLabelTop: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint, letterSpacing: 0.5 },
  axisLabelBottom: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint, letterSpacing: 0.5 },
  plotRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  axisV: { gap: PLOT_SIZE - 20, alignItems: 'flex-end' },
  axisTickLabel: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint, letterSpacing: 0.5 },
  plotContainer: {
    position: 'relative', backgroundColor: colors.surface1,
    borderRadius: radius.sm, overflow: 'hidden',
  },
  axisLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.hairline },
  axisLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: colors.hairline },
  dot: { position: 'absolute', width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2 },
  dotToday: {
    backgroundColor: colors.text,
    borderWidth: 2, borderColor: colors.teal,
    width: DOT_SIZE + 4, height: DOT_SIZE + 4, borderRadius: (DOT_SIZE + 4) / 2,
  },

  // Calendar
  calendarCard: { padding: spacing.lg, gap: spacing.md },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  calDay: { width: 16, height: 16, borderRadius: 4 },
  calDayEmpty: { backgroundColor: colors.surface2 },
  calDayToday: { borderWidth: 1.5, borderColor: colors.teal },
  calLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint },

  // Insights
  insightsList: { gap: spacing.sm },
  insightCard: { flexDirection: 'row', gap: spacing.md, padding: spacing.xl, alignItems: 'flex-start' },
  insightGlyph: { fontSize: 16, color: colors.teal, marginTop: 2 },
  insightText: { flex: 1, fontFamily: font.serif, fontSize: 14, color: colors.textMuted, lineHeight: 22 },

  // Empty
  emptyCard: { padding: spacing.xl, alignItems: 'center', gap: spacing.md, marginTop: spacing.xxl },
  emptyGlyph: { fontSize: 40, color: colors.textFaint },
  emptyTitle: { fontFamily: font.display, fontSize: 20, color: colors.text },
  emptySub: { fontFamily: font.serif, fontSize: 14, color: colors.textFaint, textAlign: 'center', lineHeight: 22 },
});
