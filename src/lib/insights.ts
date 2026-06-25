// Local analytics over the user's history — streaks, emotion distribution, valence
// trend, and factor correlations. All computed on-device from stored records.
import type { CheckIn } from './voice';
import { getEmotion } from './emotions';

export interface Dated { at: number }

export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Consecutive-day streak ending today (or yesterday), from any activity timestamps. */
export function computeStreak(timestamps: number[]): number {
  if (timestamps.length === 0) return 0;
  const days = new Set(timestamps.map(dayKey));
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to "hold" if they haven't acted yet today but did yesterday.
  if (!days.has(dayKey(cursor.getTime()))) cursor.setDate(cursor.getDate() - 1);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (days.has(dayKey(cursor.getTime()))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  return streak;
}

export interface EmotionSlice { id: string; label: string; color: string; count: number; pct: number }

export function emotionDistribution(checkins: CheckIn[]): EmotionSlice[] {
  if (checkins.length === 0) return [];
  const counts = new Map<string, number>();
  for (const c of checkins) counts.set(c.emotion, (counts.get(c.emotion) ?? 0) + 1);
  const total = checkins.length;
  return [...counts.entries()]
    .map(([id, count]) => {
      const e = getEmotion(id);
      return { id, label: e.label, color: e.color, count, pct: count / total };
    })
    .sort((a, b) => b.count - a.count);
}

/** Average valence per day for the last `days` days (null where no check-ins). */
export function valenceSeries(checkins: CheckIn[], days = 14): { key: string; value: number | null }[] {
  const byDay = new Map<string, number[]>();
  for (const c of checkins) {
    const k = dayKey(c.at);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(c.valence);
  }
  const out: { key: string; value: number | null }[] = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const k = dayKey(cursor.getTime());
    const arr = byDay.get(k);
    out.push({ key: k, value: arr ? arr.reduce((a, b) => a + b, 0) / arr.length : null });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

export interface FactorImpact { id: string; delta: number; n: number }

/** For each tagged factor, how check-ins with it compare in valence to the overall average. */
export function factorImpact(checkins: CheckIn[]): FactorImpact[] {
  const tagged = checkins.filter((c) => c.factors && c.factors.length);
  if (tagged.length < 3) return [];
  const overall = checkins.reduce((a, c) => a + c.valence, 0) / checkins.length;
  const groups = new Map<string, number[]>();
  for (const c of checkins) {
    for (const f of c.factors ?? []) {
      if (!groups.has(f)) groups.set(f, []);
      groups.get(f)!.push(c.valence);
    }
  }
  return [...groups.entries()]
    .filter(([, v]) => v.length >= 2)
    .map(([id, v]) => ({ id, n: v.length, delta: v.reduce((a, b) => a + b, 0) / v.length - overall }))
    .sort((a, b) => b.delta - a.delta);
}

export interface Summary {
  streak: number;
  total: number;
  topEmotion: string | null;
  weekCount: number;
  avgValence: number | null;
}

export function summarize(checkins: CheckIn[], extraActivity: number[] = []): Summary {
  const weekAgo = Date.now() - 7 * 86400000;
  const week = checkins.filter((c) => c.at >= weekAgo);
  const dist = emotionDistribution(checkins);
  const activity = [...checkins.map((c) => c.at), ...extraActivity];
  return {
    streak: computeStreak(activity),
    total: checkins.length,
    topEmotion: dist[0]?.id ?? null,
    weekCount: week.length,
    avgValence: checkins.length ? checkins.reduce((a, c) => a + c.valence, 0) / checkins.length : null,
  };
}
