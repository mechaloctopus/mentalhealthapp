import { useMemo } from 'react';
import {
  ScrollView, View, Text, StyleSheet, SafeAreaView,
} from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../src/store';
import { GlassCard } from '../../src/components/GlassCard';
import { VocalRadar, buildRadarData } from '../../src/components/VocalRadar';
import { FACTORS, FACTOR_MAP } from '../../src/content/factors';
import { colors, font, spacing, gradients, radius } from '../../src/theme/tokens';
import type { CheckIn } from '../../src/engine/voice';

// ── Emotion color palette ──────────────────────────────────────────────────

const EMOTION_COLORS: Record<string, string> = {
  serene:  colors.teal,
  content: colors.moss,
  joyful:  colors.amber,
  excited: colors.coral,
  anxious: colors.lavender,
  angry:   colors.coral,
  sad:     colors.blue,
  fearful: colors.indigo,
  neutral: colors.textDim,
};

function emotionColor(e: string): string {
  return EMOTION_COLORS[e.toLowerCase()] ?? colors.textFaint;
}

// ── Scatter plot helpers ───────────────────────────────────────────────────

const PLOT_SIZE = 256;
const DOT_SIZE = 10;

function valenceToX(v: number): number {
  return ((v + 1) / 2) * (PLOT_SIZE - DOT_SIZE * 2) + DOT_SIZE;
}
function arousalToY(a: number): number {
  return (1 - (a + 1) / 2) * (PLOT_SIZE - DOT_SIZE * 2) + DOT_SIZE;
}

function toDateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// ── Sparkline helpers ──────────────────────────────────────────────────────

const SPARK_W = 136;
const SPARK_H = 44;

function sparkPath(values: number[], w: number, h: number): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 0.01;
  const pad = h * 0.1;
  return values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

// ── Circadian time blocks ──────────────────────────────────────────────────

const TIME_BLOCKS = [
  { label: 'Night',     range: '10pm–5am', emoji: '🌙', hours: [22,23,0,1,2,3,4,5] },
  { label: 'Morning',   range: '6–11am',   emoji: '🌅', hours: [6,7,8,9,10,11] },
  { label: 'Midday',    range: 'Noon–3pm', emoji: '☀️', hours: [12,13,14,15] },
  { label: 'Afternoon', range: '4–7pm',    emoji: '🌤', hours: [16,17,18,19] },
  { label: 'Evening',   range: '8–9pm',    emoji: '🌆', hours: [20,21] },
];

const DOW_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

// ── Biomarker cards ────────────────────────────────────────────────────────

const BIOMARKERS: {
  code: string; name: string; color: string;
  get: (c: CheckIn) => number | null;
  desc: string;
  interp: (v: number) => string;
}[] = [
  {
    code: 'F-01', name: 'Energy', color: colors.amber,
    get: (c) => c.energy,
    desc: 'Amplitude mean + speech rate',
    interp: (v) => v > 65 ? 'High' : v < 35 ? 'Low' : 'Mid',
  },
  {
    code: 'F-02', name: 'Calmness', color: colors.teal,
    get: (c) => c.calmness,
    desc: 'Signal smoothness + rhythm',
    interp: (v) => v > 65 ? 'Calm' : v < 35 ? 'Tense' : 'Neutral',
  },
  {
    code: 'F-03', name: 'Stability', color: colors.blue,
    get: (c) => c.stability,
    desc: 'Variance + amplitude center',
    interp: (v) => v > 65 ? 'Steady' : v < 35 ? 'Variable' : 'Moderate',
  },
  {
    code: 'F-04', name: 'Coherence', color: colors.violet,
    get: (c) => c.voiceFeatures?.voiceCoherence ?? null,
    desc: 'Lag-3 autocorrelation',
    interp: (v) => v > 65 ? 'Periodic' : v < 35 ? 'Irregular' : 'Normal',
  },
  {
    code: 'F-05', name: 'Burst', color: colors.coral,
    get: (c) => c.voiceFeatures?.burstRegularity ?? null,
    desc: 'Speech burst regularity',
    interp: (v) => v > 65 ? 'Regular' : v < 35 ? 'Scattered' : 'Mixed',
  },
  {
    code: 'F-06', name: 'Entropy', color: colors.lavender,
    get: (c) => c.voiceFeatures?.temporalEntropy ?? null,
    desc: 'Loudness distribution spread',
    interp: (v) => v > 65 ? 'Expressive' : v < 35 ? 'Monotone' : 'Balanced',
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function SignalTab() {
  const recentCheckIns = useStore((s) => s.recentCheckIns);
  const todayCheckIn   = useStore((s) => s.todayCheckIn);
  const baseline       = useStore((s) => s.baseline);
  const streak         = useStore((s) => s.streak);

  // Last 30 days in both orderings
  const last30 = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return [...recentCheckIns.filter((c) => c.at >= cutoff)].reverse();
  }, [recentCheckIns]);

  const last30Desc = useMemo(() => [...last30].reverse(), [last30]);

  // Calendar data
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

  // Baseline drift — 7-day rolling vs stored baseline
  const baselineDrift = useMemo(() => {
    if (!baseline || recentCheckIns.length < 3) return null;
    const recent7 = recentCheckIns.slice(0, 7);
    if (recent7.length < 3) return null;
    const avg = recent7.reduce((s, c) => s + c.valence, 0) / recent7.length;
    const drift = avg - baseline.valence;
    if (Math.abs(drift) < 0.25) return null;
    return { drift, stale: drift < -0.3 };
  }, [baseline, recentCheckIns]);

  // Circadian patterns (uses full history for more data points)
  const timePatterns = useMemo(() => {
    return TIME_BLOCKS.map((block) => {
      const cs = recentCheckIns.filter((c) => block.hours.includes(new Date(c.at).getHours()));
      if (cs.length === 0) return { ...block, n: 0, avg: null as number | null };
      const avg = cs.reduce((s, c) => s + c.valence, 0) / cs.length;
      return { ...block, n: cs.length, avg };
    }).filter((b) => b.n > 0);
  }, [recentCheckIns]);

  // Day-of-week patterns
  const dowPatterns = useMemo(() => {
    return DOW_LABELS.map((label, i) => {
      const cs = recentCheckIns.filter((c) => new Date(c.at).getDay() === i);
      const avg = cs.length > 0
        ? cs.reduce((s, c) => s + c.valence, 0) / cs.length
        : null;
      return { label, n: cs.length, avg };
    });
  }, [recentCheckIns]);

  // Factor correlations
  const factorCorrelations = useMemo(() => {
    const tagged = recentCheckIns.filter((c) => c.factors?.length);
    if (tagged.length < 3) return [];
    const overall = recentCheckIns.reduce((s, c) => s + c.valence, 0) / recentCheckIns.length;
    const map: Record<string, number[]> = {};
    tagged.forEach((c) => c.factors?.forEach((f) => {
      if (!map[f]) map[f] = [];
      map[f]!.push(c.valence);
    }));
    return Object.entries(map)
      .map(([id, vals]) => ({
        id,
        n: vals.length,
        avg: vals.reduce((s, v) => s + v, 0) / vals.length,
        delta: vals.reduce((s, v) => s + v, 0) / vals.length - overall,
      }))
      .filter((f) => f.n >= 2)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 8);
  }, [recentCheckIns]);

  // Pattern insights
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
    else if (avgValence <= -0.1) ins.push('Overall valence has been lower — the signal is being honest.');
    else ins.push('Valence is balanced — neither strongly pleasant nor difficult.');
    if (avgArousal >= 0.15) ins.push('Running high energy over the past month.');
    else if (avgArousal <= -0.15) ins.push('Energy has been calmer and more settled.');
    return ins;
  }, [last30]);

  // Radar
  const radarToday = todayCheckIn
    ? buildRadarData(todayCheckIn, todayCheckIn.voiceFeatures) : null;
  const radarBaseline = baseline
    ? buildRadarData(baseline, baseline.voiceFeatures) : null;

  // Sparklines
  const valenceValues = last30.map((c) => c.valence);
  const arousalValues = last30.map((c) => c.arousal);

  // Voice-only for biomarker averages
  const voiceCheckins = last30.filter((c) => c.source === 'voice');


  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[...gradients.canvas]} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(84,104,196,0.14)', 'rgba(48,133,172,0.06)', 'rgba(0,0,0,0)']}
        style={[StyleSheet.absoluteFill, { height: 320 }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Signal Lab</Text>
          <Text style={styles.titleGlyph}>≋</Text>
        </View>

        {/* ── Streak ── */}
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

        {/* ── Baseline drift alert ── */}
        {baselineDrift && (
          <GlassCard style={[
            styles.driftCard,
            { borderColor: baselineDrift.drift > 0 ? `${colors.teal}44` : `${colors.coral}44` },
          ]}>
            <Text style={[
              styles.driftIcon,
              { color: baselineDrift.drift > 0 ? colors.teal : colors.coral },
            ]}>
              {baselineDrift.drift > 0 ? '↑' : '↓'}
            </Text>
            <View style={styles.driftBody}>
              <Text style={[
                styles.driftTitle,
                { color: baselineDrift.drift > 0 ? colors.teal : colors.coral },
              ]}>
                Signal {baselineDrift.drift > 0 ? 'above' : 'below'} baseline
              </Text>
              <Text style={styles.driftSub}>
                Your 7-day average has shifted{' '}
                {(Math.abs(baselineDrift.drift) * 100).toFixed(0)} points
                {baselineDrift.drift > 0 ? ' higher than' : ' below'} your baseline.
                {baselineDrift.stale ? ' Consider a baseline refresh.' : ''}
              </Text>
            </View>
          </GlassCard>
        )}

        {/* ── Today's voice profile ── */}
        {radarToday && (
          <>
            <Text style={styles.sectionTitle}>Today's Voice Profile</Text>
            <GlassCard style={styles.radarCard}>
              <View style={styles.radarRow}>
                <VocalRadar today={radarToday} baseline={radarBaseline} size={196} />
                <View style={styles.radarMeta}>
                  <View style={styles.legendRow}>
                    <View style={[styles.legendLine, { borderColor: colors.violet }]} />
                    <Text style={styles.legendText}>Today</Text>
                  </View>
                  {radarBaseline && (
                    <View style={styles.legendRow}>
                      <View style={[styles.legendLine, { borderColor: colors.teal, borderStyle: 'dashed' }]} />
                      <Text style={styles.legendText}>Baseline</Text>
                    </View>
                  )}
                  {todayCheckIn?.voiceFeatures && (
                    <>
                      <View style={styles.miniDivider} />
                      <MiniStat label="Shimmer" value={todayCheckIn.voiceFeatures.shimmer} />
                      <MiniStat label="Entropy" value={todayCheckIn.voiceFeatures.temporalEntropy} />
                      <MiniStat label="Pause" value={todayCheckIn.voiceFeatures.pauseIndex} />
                      <MiniStat label="Slope" value={todayCheckIn.voiceFeatures.prosodicSlope} />
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
              style={styles.bioScroll} contentContainerStyle={styles.bioContent}>
              {BIOMARKERS.map((bm) => {
                const todayVal = todayCheckIn ? bm.get(todayCheckIn) : null;
                const avgVal = voiceCheckins.length > 0
                  ? voiceCheckins.reduce((s, c) => {
                    const v = bm.get(c);
                    return v !== null ? s + v : s;
                  }, 0) / voiceCheckins.filter((c) => bm.get(c) !== null).length
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
                    {avgVal !== null && !isNaN(avgVal) && (
                      <Text style={styles.bio30avg}>30d avg: {Math.round(avgVal)}</Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* ── Time patterns ── */}
        {timePatterns.length >= 2 && (
          <>
            <Text style={styles.sectionTitle}>Time Patterns</Text>
            <GlassCard style={styles.timeCard}>
              <Text style={styles.timeCardHeading}>When do you feel best?</Text>
              {timePatterns.map((block) => (
                <View key={block.label} style={styles.timeRow}>
                  <Text style={styles.timeEmoji}>{block.emoji}</Text>
                  <View style={styles.timeInfo}>
                    <Text style={styles.timeLabel}>{block.label}</Text>
                    <Text style={styles.timeRange}>{block.range}</Text>
                  </View>
                  <View style={styles.timeBarWrap}>
                    <View style={styles.timeBarTrack}>
                      <View style={styles.timeBarCenter} />
                      {block.avg !== null && Math.abs(block.avg) > 0.02 && (
                        <View style={[
                          styles.timeBarFill,
                          block.avg >= 0
                            ? { left: '50%', width: `${Math.min(50, Math.abs(block.avg) * 55)}%` as any, backgroundColor: colors.teal }
                            : { right: '50%', width: `${Math.min(50, Math.abs(block.avg) * 55)}%` as any, backgroundColor: colors.coral },
                        ]} />
                      )}
                    </View>
                  </View>
                  <Text style={[
                    styles.timeDelta,
                    { color: (block.avg ?? 0) >= 0 ? colors.teal : colors.coral },
                  ]}>
                    {block.avg !== null
                      ? `${block.avg >= 0 ? '+' : ''}${block.avg.toFixed(2)}`
                      : '—'}
                  </Text>
                </View>
              ))}

              {/* Day-of-week strip */}
              <View style={styles.dowRow}>
                {dowPatterns.map((d) => (
                  <View key={d.label} style={styles.dowCell}>
                    <View style={[
                      styles.dowDot,
                      d.avg !== null && d.n > 0 && {
                        backgroundColor: d.avg >= 0 ? colors.teal : colors.coral,
                        opacity: Math.min(1, 0.3 + Math.abs(d.avg) * 0.7),
                      },
                    ]} />
                    <Text style={styles.dowLabel}>{d.label}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </>
        )}

        {/* ── 30-day trend sparklines ── */}
        {last30.length >= 4 && (
          <>
            <Text style={styles.sectionTitle}>30-Day Trend</Text>
            <GlassCard style={styles.trendCard}>
              <View style={styles.trendRow}>
                <TrendSparkline values={valenceValues} color={colors.teal} label="Valence" />
                <View style={styles.trendDivider} />
                <TrendSparkline values={arousalValues} color={colors.coral} label="Arousal" />
              </View>
            </GlassCard>
          </>
        )}

        {/* ── Constellation scatter plot ── */}
        {last30Desc.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Constellation — 30 days</Text>
            <GlassCard style={styles.plotCard}>
              <Text style={styles.axisLabelEdge}>High energy</Text>
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
                      opacity: 0.5 + (i / last30Desc.length) * 0.5,
                    }]} />
                  ))}
                  {todayCheckIn && (
                    <View style={[styles.dot, styles.dotToday, {
                      left: valenceToX(todayCheckIn.valence) - (DOT_SIZE + 4) / 2,
                      top: arousalToY(todayCheckIn.arousal) - (DOT_SIZE + 4) / 2,
                    }]} />
                  )}
                </View>
              </View>
              <Text style={styles.axisLabelEdge}>Low energy</Text>
            </GlassCard>
          </>
        )}

        {/* ── Factor insights ── */}
        {factorCorrelations.length >= 2 && (
          <>
            <Text style={styles.sectionTitle}>Factor Insights</Text>
            <GlassCard style={styles.factorCard}>
              <Text style={styles.factorCardSub}>
                Personal correlations from {recentCheckIns.filter((c) => c.factors?.length).length} tagged check-ins
              </Text>
              {factorCorrelations.map((fc) => {
                const factor = FACTOR_MAP[fc.id];
                const pct = Math.min(100, Math.abs(fc.delta) * 200);
                return (
                  <View key={fc.id} style={styles.fcRow}>
                    <Text style={styles.fcEmoji}>{factor?.emoji ?? '·'}</Text>
                    <View style={styles.fcInfo}>
                      <Text style={styles.fcName}>{factor?.label ?? fc.id}</Text>
                      <View style={styles.fcBarTrack}>
                        <View style={[styles.fcBarCenter]} />
                        {Math.abs(fc.delta) > 0.01 && (
                          <View style={[
                            styles.fcBarFill,
                            fc.delta >= 0
                              ? { left: '50%', width: `${pct / 2}%` as any, backgroundColor: colors.teal }
                              : { right: '50%', width: `${pct / 2}%` as any, backgroundColor: colors.coral },
                          ]} />
                        )}
                      </View>
                    </View>
                    <View style={styles.fcMeta}>
                      <Text style={[
                        styles.fcDelta,
                        { color: fc.delta >= 0 ? colors.teal : colors.coral },
                      ]}>
                        {fc.delta >= 0 ? '↑' : '↓'} {Math.abs(fc.delta).toFixed(2)}
                      </Text>
                      <Text style={styles.fcN}>n={fc.n}</Text>
                    </View>
                  </View>
                );
              })}
              <Text style={styles.factorHint}>
                Showing factors that appear in ≥2 check-ins, ranked by impact on valence.
              </Text>
            </GlassCard>
          </>
        )}

        {/* ── 30-day calendar ── */}
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
                {Object.entries(EMOTION_COLORS).slice(0, 6).map(([e, color]) => (
                  <View key={e} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: color }]} />
                    <Text style={styles.legendLabel}>{e}</Text>
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
        {last30.length === 0 && !radarToday && (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyGlyph}>≋</Text>
            <Text style={styles.emptyTitle}>The map is forming</Text>
            <Text style={styles.emptySub}>
              Check in daily and your Signal Lab will come alive after a few sessions.
            </Text>
          </GlassCard>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function MiniStat({ label, value, unit = '' }: { label: string; value: number; unit?: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatValue}>{Math.round(value)}{unit}</Text>
    </View>
  );
}

function TrendSparkline({ values, color, label }: { values: number[]; color: string; label: string }) {
  const d = sparkPath(values, SPARK_W, SPARK_H);
  const midY = (SPARK_H * 0.5).toFixed(1);
  const last = values.length > 0 ? values[values.length - 1]! : null;

  const lastX = SPARK_W;
  const lastY = last !== null && values.length >= 2
    ? (() => {
      const min = Math.min(...values); const max = Math.max(...values);
      const range = max - min || 0.01; const pad = SPARK_H * 0.1;
      return SPARK_H - pad - ((last - min) / range) * (SPARK_H - pad * 2);
    })()
    : SPARK_H / 2;

  return (
    <View style={styles.sparkWrap}>
      <Text style={[styles.sparkLabel, { color }]}>{label}</Text>
      <Svg width={SPARK_W} height={SPARK_H}>
        <Line x1={0} y1={midY} x2={SPARK_W} y2={midY}
          stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        {d !== '' && (
          <Path d={d} fill="none" stroke={color} strokeWidth={1.5}
            strokeLinecap="round" strokeLinejoin="round" />
        )}
        {last !== null && (
          <Circle cx={lastX} cy={lastY} r={3} fill={color} />
        )}
      </Svg>
      {last !== null && (
        <Text style={[styles.sparkValue, { color }]}>
          {last >= 0 ? '+' : ''}{last.toFixed(2)}
        </Text>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg,
    paddingBottom: spacing.xxl, gap: spacing.md,
  },

  header: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  title: { fontFamily: font.display, fontSize: 28, color: colors.text },
  titleGlyph: { fontFamily: font.sans, fontSize: 18, color: colors.teal, marginLeft: 'auto' as any },

  sectionTitle: {
    fontFamily: font.sansSemibold, fontSize: 11, letterSpacing: 1.2,
    textTransform: 'uppercase', color: colors.textFaint, marginTop: spacing.sm,
  },

  // Streak
  streakCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  streakGlyph: { fontSize: 22, color: colors.amber },
  streakText: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  streakNumber: { fontFamily: font.displayBold, fontSize: 26, color: colors.amber },
  streakLabel: { fontFamily: font.sans, fontSize: 12, color: colors.textMuted },
  streakDesc: { flex: 1, fontFamily: font.serif, fontSize: 12, color: colors.textFaint, textAlign: 'right' },

  // Baseline drift
  driftCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    padding: spacing.lg, borderWidth: 1,
  },
  driftIcon: { fontSize: 22, fontFamily: font.sansBold, marginTop: 2 },
  driftBody: { flex: 1, gap: 4 },
  driftTitle: { fontFamily: font.sansSemibold, fontSize: 13 },
  driftSub: { fontFamily: font.serif, fontSize: 12, color: colors.textFaint, lineHeight: 18 },

  // Radar
  radarCard: { padding: spacing.lg },
  radarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  radarMeta: { flex: 1, gap: spacing.xs },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendLine: { width: 18, height: 0, borderTopWidth: 2, borderRadius: 1 },
  legendText: { fontFamily: font.sans, fontSize: 11, color: colors.textFaint },
  miniDivider: { height: 1, backgroundColor: colors.hairline, marginVertical: 4 },
  miniStat: { flexDirection: 'row', justifyContent: 'space-between' },
  miniStatLabel: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint },
  miniStatValue: { fontFamily: font.sansBold, fontSize: 11, color: colors.textMuted },

  // Biomarkers
  bioScroll: { marginHorizontal: -spacing.lg },
  bioContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  bioCard: {
    width: 130, padding: spacing.md, gap: 6,
    backgroundColor: colors.panel, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.panelBorder,
  },
  bioCode: { fontFamily: font.sansBold, fontSize: 10, letterSpacing: 1 },
  bioName: { fontFamily: font.display, fontSize: 16, color: colors.text },
  bioDesc: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint, lineHeight: 14 },
  bioBarTrack: { height: 4, backgroundColor: colors.surface2, borderRadius: 2, overflow: 'hidden' },
  bioBarFill: { height: '100%', borderRadius: 2 },
  bioValue: { fontFamily: font.sansBold, fontSize: 11 },
  bioEmpty: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint, fontStyle: 'italic' },
  bio30avg: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint },

  // Time patterns
  timeCard: { padding: spacing.lg, gap: spacing.md },
  timeCardHeading: { fontFamily: font.display, fontSize: 16, color: colors.text },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  timeEmoji: { fontSize: 16, width: 24, textAlign: 'center' as any },
  timeInfo: { width: 72 },
  timeLabel: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.textMuted },
  timeRange: { fontFamily: font.sans, fontSize: 9, color: colors.textFaint },
  timeBarWrap: { flex: 1 },
  timeBarTrack: { height: 6, backgroundColor: colors.surface2, borderRadius: 3, overflow: 'hidden', position: 'relative' },
  timeBarCenter: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: colors.hairline },
  timeBarFill: { position: 'absolute', top: 0, bottom: 0 },
  timeDelta: { fontFamily: font.sansBold, fontSize: 11, width: 40, textAlign: 'right' as any },

  // Day-of-week
  dowRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm },
  dowCell: { alignItems: 'center', gap: 4 },
  dowDot: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.surface2 },
  dowLabel: { fontFamily: font.sans, fontSize: 9, color: colors.textFaint, letterSpacing: 0.3 },

  // Trend
  trendCard: { padding: spacing.lg },
  trendRow: { flexDirection: 'row', alignItems: 'flex-start' },
  trendDivider: { width: 1, backgroundColor: colors.hairline, marginHorizontal: spacing.md, alignSelf: 'stretch' },
  sparkWrap: { flex: 1, gap: 4 },
  sparkLabel: { fontFamily: font.sansSemibold, fontSize: 10, letterSpacing: 0.6 },
  sparkValue: { fontFamily: font.sansBold, fontSize: 11 },

  // Scatter plot
  plotCard: { padding: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  axisLabelEdge: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint, letterSpacing: 0.5 },
  plotRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  axisV: { gap: PLOT_SIZE - 20, alignItems: 'flex-end' },
  axisTickLabel: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint, letterSpacing: 0.4 },
  plotContainer: {
    position: 'relative', backgroundColor: colors.surface1,
    borderRadius: radius.sm, overflow: 'hidden',
  },
  axisLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.hairline },
  axisLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: colors.hairline },
  dot: { position: 'absolute', width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2 },
  dotToday: {
    backgroundColor: colors.text, borderWidth: 2, borderColor: colors.teal,
    width: DOT_SIZE + 4, height: DOT_SIZE + 4, borderRadius: (DOT_SIZE + 4) / 2,
  },

  // Factor insights
  factorCard: { padding: spacing.lg, gap: spacing.sm },
  factorCardSub: { fontFamily: font.sans, fontSize: 11, color: colors.textFaint },
  fcRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  fcEmoji: { fontSize: 16, width: 24, textAlign: 'center' as any },
  fcInfo: { flex: 1, gap: 4 },
  fcName: { fontFamily: font.sansSemibold, fontSize: 12, color: colors.textMuted },
  fcBarTrack: {
    height: 5, backgroundColor: colors.surface2, borderRadius: 3,
    overflow: 'hidden', position: 'relative',
  },
  fcBarCenter: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: colors.hairline },
  fcBarFill: { position: 'absolute', top: 0, bottom: 0 },
  fcMeta: { alignItems: 'flex-end', gap: 2 },
  fcDelta: { fontFamily: font.sansBold, fontSize: 12 },
  fcN: { fontFamily: font.sans, fontSize: 9, color: colors.textFaint },
  factorHint: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint, lineHeight: 15, marginTop: spacing.xs },

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
