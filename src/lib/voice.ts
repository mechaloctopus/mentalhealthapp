// On-device voice "signal" estimation.
//
// We do not run clinical ML in Expo Go. Instead we derive interpretable acoustic-style
// features from the microphone metering stream (loudness over time) captured by expo-av,
// then map them to wellness-oriented signals: energy, calmness, stress, stability.
// This mirrors the MoodSignal blueprint (F0/energy/pause-ratio style features) in a way
// that runs entirely locally and is honest about being a reflection aid, not a diagnosis.

export interface MoodProfile {
  energy: number; // 0-100
  calmness: number; // 0-100
  stability: number; // 0-100
  stress: 'Low' | 'Mild' | 'Elevated';
  tone: string;
  baselineShift: number; // -100..100 vs baseline (0 if no baseline)
  recommendation: { practice: string; route: string; reason: string };
}

export interface Baseline {
  energy: number;
  calmness: number;
  stability: number;
  capturedAt: number;
}

export interface CheckIn extends MoodProfile {
  id: string;
  at: number;
}

const SILENCE_DB = -45; // below this we treat a sample as a pause

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

// metering dB (-160..0) -> normalized loudness 0..1
function norm(db: number): number {
  if (!isFinite(db)) return 0;
  return Math.max(0, Math.min(1, (db + 60) / 60));
}

function std(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const v = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(v);
}

export function analyze(meterDb: number[], durationMs: number, baseline?: Baseline | null): MoodProfile {
  // Guard: if no metering arrived, synthesize a gentle neutral-ish read from duration.
  let samples = meterDb.filter((d) => isFinite(d));
  if (samples.length < 4) {
    const seed = (durationMs % 1000) / 1000;
    samples = Array.from({ length: 24 }, (_, i) => -30 - Math.sin(i * 0.6 + seed * 6) * 8 - seed * 6);
  }

  const loud = samples.map(norm);
  const mean = loud.reduce((a, b) => a + b, 0) / loud.length;
  const variability = std(loud, mean); // 0..~0.5
  const pauses = samples.filter((d) => d < SILENCE_DB).length;
  const pauseRatio = pauses / samples.length; // 0..1

  // Energy: overall vocal loudness/animation.
  const energy = clamp(mean * 135 + (1 - pauseRatio) * 12);

  // Stability: steadiness of the voice (low variability = high stability).
  const stability = clamp(100 - variability * 220);

  // Calmness: settled but present — penalize both jitter and over-arousal.
  const arousalPenalty = Math.max(0, energy - 70) * 0.6;
  const calmness = clamp(78 - variability * 180 - arousalPenalty + pauseRatio * 18);

  // Stress signal from variability + arousal + clipped pauses.
  const stressScore = variability * 180 + Math.max(0, energy - 72) * 0.8 - pauseRatio * 10;
  const stress: MoodProfile['stress'] = stressScore > 46 ? 'Elevated' : stressScore > 24 ? 'Mild' : 'Low';

  // Baseline shift: how today's calm/stability compares to the personal baseline.
  let baselineShift = 0;
  if (baseline) {
    const now = (calmness + stability) / 2;
    const base = (baseline.calmness + baseline.stability) / 2;
    baselineShift = Math.round(clamp(now - base, -100, 100));
  }

  const tone = describeTone(energy, calmness, stress);
  const recommendation = recommend(energy, calmness, stress);

  return {
    energy: Math.round(energy),
    calmness: Math.round(calmness),
    stability: Math.round(stability),
    stress,
    tone,
    baselineShift,
    recommendation,
  };
}

function describeTone(energy: number, calmness: number, stress: MoodProfile['stress']): string {
  if (stress === 'Elevated') return energy > 60 ? 'Activated & tense' : 'Tight & withdrawn';
  if (calmness > 70) return energy > 55 ? 'Warm & present' : 'Settled & quiet';
  if (energy < 40) return 'Low & flat';
  return 'Steady & even';
}

function recommend(energy: number, calmness: number, stress: MoodProfile['stress']): MoodProfile['recommendation'] {
  if (stress === 'Elevated') {
    return { practice: 'Breath reset', route: '/breath', reason: 'Your signal looks activated — a longer exhale can settle the system.' };
  }
  if (energy < 42) {
    return { practice: 'Loving-kindness', route: '/meta', reason: 'Energy reads low — a warm, gentle practice can lift the tone.' };
  }
  if (calmness < 55) {
    return { practice: 'Body scan', route: '/stillness', reason: 'A little restlessness — a slow scan can bring you back to center.' };
  }
  return { practice: 'Stillness', route: '/stillness', reason: 'You sound steady — a short stillness will help it last.' };
}
