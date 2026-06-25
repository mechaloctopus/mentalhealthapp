// On-device voice "affect" estimation.
//
// We do not run clinical ML in Expo Go. From the microphone loudness envelope we
// derive interpretable features (loudness, variability, pause ratio, a syllable-rate
// proxy) and estimate a point on the Valence × Arousal map. Arousal is reliable from
// these features; valence is approximate — so we always report a confidence and fuse
// with the user's self-reported emotion. This is a reflection aid, not a diagnosis.
import { matchEmotion, getEmotion, type Emotion } from './emotions';

export type StressLevel = 'Low' | 'Mild' | 'Elevated';

export interface Affect {
  valence: number; // -1..1
  arousal: number; // -1..1
  energy: number; // 0-100
  calmness: number; // 0-100
  stability: number; // 0-100
  stress: StressLevel;
  confidence: number; // 0..1 — voice-only confidence
  voiceEmotion: string; // emotion id from voice
  tone: string;
}

export interface Baseline {
  energy: number;
  calmness: number;
  stability: number;
  valence: number;
  arousal: number;
  capturedAt: number;
}

export interface Recommendation {
  practice: string;
  route: string;
  reason: string;
}

export interface CheckIn {
  id: string;
  at: number;
  valence: number;
  arousal: number;
  energy: number;
  calmness: number;
  stability: number;
  stress: StressLevel;
  confidence: number;
  voiceEmotion: string;
  selfEmotion?: string;
  emotion: string; // final emotion id (self-report wins when present)
  tone: string;
  baselineShift: number;
  note?: string;
  source: 'voice' | 'self';
  factors?: string[];
  recommendation: Recommendation;
}

const SILENCE_DB = -45;

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}
function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
function norm(db: number): number {
  if (!isFinite(db)) return 0;
  return Math.max(0, Math.min(1, (db + 60) / 60));
}
function std(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const v = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(v);
}

// Count loudness-envelope peaks (a rough syllable-rate proxy).
function countPeaks(loud: number[], thresh: number): number {
  let peaks = 0;
  for (let i = 1; i < loud.length - 1; i++) {
    if (loud[i] > thresh && loud[i] >= loud[i - 1] && loud[i] > loud[i + 1]) peaks++;
  }
  return peaks;
}

/** Estimate affect (valence/arousal + derived signals) from the loudness envelope. */
export function analyzeVoice(meterDb: number[], durationMs: number): Affect {
  let samples = meterDb.filter((d) => isFinite(d));
  if (samples.length < 4) {
    const seed = (durationMs % 1000) / 1000;
    samples = Array.from({ length: 24 }, (_, i) => -30 - Math.sin(i * 0.6 + seed * 6) * 8 - seed * 6);
  }

  const loud = samples.map(norm);
  const mean = loud.reduce((a, b) => a + b, 0) / loud.length;
  const variability = std(loud, mean); // ~0..0.35
  const pauseRatio = samples.filter((d) => d < SILENCE_DB).length / samples.length;

  const seconds = Math.max(1, durationMs / 1000);
  const peaks = countPeaks(loud, mean + variability * 0.4);
  const rate = peaks / seconds; // peaks/sec

  const meanN = clamp01(mean);
  const varN = clamp01(variability / 0.35);
  const rateN = clamp01(rate / 4);
  const engagement = 1 - pauseRatio;
  const steadiness = 1 - varN;

  // Arousal: activation from loudness, variability, and speech rate (reliable).
  const arousal01 = clamp01(0.5 * meanN + 0.3 * varN + 0.2 * rateN);
  const arousal = arousal01 * 2 - 1;

  // Valence: approximate — steadier, engaged speech reads positive; jittery/activated
  // or very flat/low reads negative. Low confidence on its own.
  const agitation = varN * arousal01;
  const flatLow = Math.max(0, 0.4 - meanN);
  const valence01 = clamp01(
    0.5 + 0.3 * (steadiness - 0.5) + 0.18 * (engagement - 0.5) - 0.45 * agitation - 0.3 * flatLow
  );
  const valence = valence01 * 2 - 1;

  // Derived continuity signals.
  const energy = Math.round(clamp(50 + arousal * 45 + meanN * 8 - 4));
  const calmness = Math.round(clamp(52 - arousal * 38 + valence * 22));
  const stability = Math.round(clamp(100 - varN * 72));
  const stressScore = Math.max(0, arousal) * 0.6 + Math.max(0, -valence) * 0.5;
  const stress: StressLevel = stressScore > 0.55 ? 'Elevated' : stressScore > 0.3 ? 'Mild' : 'Low';

  // Voice confidence: arousal trustworthy, valence weak → moderate overall.
  const baseConfidence = 0.5 + 0.18 * Math.abs(arousal); // 0.5..0.68
  const match = matchEmotion(valence, arousal, baseConfidence);

  return {
    valence,
    arousal,
    energy,
    calmness,
    stability,
    stress,
    confidence: match.confidence,
    voiceEmotion: match.primary.id,
    tone: match.primary.label,
  };
}

export function recommendFor(emotion: Emotion): Recommendation {
  const reasons: Record<string, string> = {
    overwhelmed: 'A longer exhale tells your system it is safe to slow down.',
    anxious: 'Paced breathing can settle an activated nervous system.',
    frustrated: 'A few slow breaths create space before the next response.',
    sad: 'A warm, gentle practice can meet sadness with kindness.',
    lonely: 'Loving-kindness widens the circle and softens disconnection.',
    drained: 'A slow body scan restores without demanding energy.',
    calm: 'A short stillness helps the calm last.',
    content: 'A brief stillness deepens what is already here.',
    grateful: 'Loving-kindness extends the warmth outward.',
    proud: 'Let the feeling land before moving on.',
    joy: 'Let a little sound carry the brightness.',
    excited: 'Channel the energy with a few intentional breaths.',
  };
  return {
    practice: emotion.practice.label,
    route: emotion.practice.route,
    reason: reasons[emotion.id] ?? 'A short practice can help this settle.',
  };
}

export function baselineShift(now: { valence: number; arousal: number }, baseline?: Baseline | null): number {
  if (!baseline) return 0;
  // Movement toward pleasant + calm vs baseline, on a -100..100 scale.
  const bv = baseline.valence ?? 0;
  const ba = baseline.arousal ?? 0;
  const nowScore = now.valence * 0.6 - Math.max(0, now.arousal) * 0.4;
  const baseScore = bv * 0.6 - Math.max(0, ba) * 0.4;
  return Math.round(clamp((nowScore - baseScore) * 100, -100, 100));
}

/** Fuse the voice affect with an optional self-report into a saved check-in. */
export function buildCheckIn(opts: {
  affect: Affect;
  baseline?: Baseline | null;
  selfEmotion?: string;
  note?: string;
  factors?: string[];
}): CheckIn {
  const { affect, baseline, selfEmotion, note, factors } = opts;
  const finalId = selfEmotion ?? affect.voiceEmotion;
  const finalEmotion = getEmotion(finalId);
  return {
    id: Math.random().toString(36).slice(2),
    at: Date.now(),
    valence: affect.valence,
    arousal: affect.arousal,
    energy: affect.energy,
    calmness: affect.calmness,
    stability: affect.stability,
    stress: affect.stress,
    confidence: affect.confidence,
    voiceEmotion: affect.voiceEmotion,
    selfEmotion,
    emotion: finalId,
    tone: finalEmotion.label,
    baselineShift: baselineShift(affect, baseline),
    note,
    factors,
    source: 'voice',
    recommendation: recommendFor(finalEmotion),
  };
}

/** A self-report-only check-in (no voice), e.g. the quick "how do you feel" wheel. */
export function buildSelfCheckIn(emotionId: string, note?: string, factors?: string[]): CheckIn {
  const e = getEmotion(emotionId);
  return {
    id: Math.random().toString(36).slice(2),
    at: Date.now(),
    valence: e.valence,
    arousal: e.arousal,
    energy: Math.round(clamp(50 + e.arousal * 45)),
    calmness: Math.round(clamp(52 - e.arousal * 38 + e.valence * 22)),
    stability: 70,
    stress: e.valence < -0.3 && e.arousal > 0.3 ? 'Elevated' : e.arousal > 0.3 ? 'Mild' : 'Low',
    confidence: 1, // self-report is ground truth
    voiceEmotion: e.id,
    selfEmotion: e.id,
    emotion: e.id,
    tone: e.label,
    baselineShift: 0,
    note,
    factors,
    source: 'self',
    recommendation: recommendFor(e),
  };
}
