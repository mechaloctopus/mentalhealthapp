// On-device voice affect estimation from the microphone loudness envelope.
// Reflective wellness signal only — not clinical or diagnostic.
// Biomarker refs: Cummins (2015), Alpert (2001), Scherer (2003), Moore (2007), Trevino (2011).

import { matchEmotion, getEmotion } from '../content/emotions';

export type StressLevel = 'Low' | 'Mild' | 'Elevated';
export type VoiceQualityReason = 'ok' | 'too-short' | 'too-few-samples' | 'mostly-silent' | 'flat-signal';

export interface VoiceSampleQuality {
  usable: boolean;
  reason: VoiceQualityReason;
  finiteSamples: number;
  activeRatio: number;
  rangeDb: number;
}

// Six amplitude-domain biomarkers — all 0-100, no FFT required.
export interface VoiceFeatures {
  shimmer: number;          // amplitude micro-variation between adjacent frames
  temporalEntropy: number;  // Shannon entropy of loudness histogram (monotone=low)
  prosodicSlope: number;    // OLS energy trend: <50 falling, 50 flat, >50 rising
  burstRegularity: number;  // speech-burst duration consistency (higher = steadier)
  pauseIndex: number;       // weighted pause prominence (ratio + long-pause count)
  voiceCoherence: number;   // lag-3 autocorrelation (higher = more periodic/stable)
}

export interface Affect {
  valence: number;
  arousal: number;
  energy: number;
  calmness: number;
  stability: number;
  stress: StressLevel;
  confidence: number;
  voiceEmotion: string;
  tone: string;
  voiceFeatures?: VoiceFeatures;
}

export interface Baseline {
  energy: number;
  calmness: number;
  stability: number;
  valence: number;
  arousal: number;
  capturedAt: number;
  voiceFeatures?: VoiceFeatures;
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
  emotion: string;
  tone: string;
  baselineShift: number;
  note?: string;
  source: 'voice' | 'self';
  factors?: string[];
  voiceFeatures?: VoiceFeatures;
}

const SILENCE_DB = -45;
const ACTIVITY_DB = -58;

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

function mean(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function std(values: number[], m: number): number {
  if (values.length < 2) return 0;
  return Math.sqrt(values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length);
}

function countPeaks(loud: number[], threshold: number): number {
  let peaks = 0;
  for (let i = 1; i < loud.length - 1; i++) {
    if (loud[i]! > threshold && loud[i]! >= loud[i - 1]! && loud[i]! > loud[i + 1]!) peaks++;
  }
  return peaks;
}

// ── Biomarker computations ──────────────────────────────────────────────────

function computeShimmer(loud: number[]): number {
  if (loud.length < 2) return 50;
  let sum = 0;
  for (let i = 0; i < loud.length - 1; i++) sum += Math.abs(loud[i + 1]! - loud[i]!);
  // Typical range: 0–0.15 per normalized unit
  return clamp(sum / (loud.length - 1) / 0.15 * 100);
}

function computeTemporalEntropy(loud: number[]): number {
  const N = loud.length;
  if (N < 2) return 50;
  const bins = new Array<number>(10).fill(0);
  for (const v of loud) bins[Math.min(9, Math.floor(v * 10))]!++;
  let H = 0;
  for (const b of bins) {
    if (b > 0) { const p = b / N; H -= p * Math.log2(p); }
  }
  return clamp(H / Math.log2(10) * 100);
}

function computeProsodicSlope(loud: number[]): number {
  const n = loud.length;
  if (n < 4) return 50;
  const xm = (n - 1) / 2;
  const ym = mean(loud);
  let num = 0; let den = 0;
  for (let i = 0; i < n; i++) { num += (i - xm) * (loud[i]! - ym); den += (i - xm) ** 2; }
  const beta = den > 0 ? num / den : 0;
  // 0.004/sample ≈ ±50-unit swing
  return clamp(50 + beta / 0.004 * 50);
}

function computeBurstRegularity(loud: number[], activityNorm: number): number {
  const lengths: number[] = [];
  let inBurst = false; let len = 0;
  for (const v of loud) {
    if (v > activityNorm) { inBurst = true; len++; }
    else if (inBurst) { lengths.push(len); len = 0; inBurst = false; }
  }
  if (inBurst && len > 0) lengths.push(len);
  if (lengths.length < 2) return 60;
  const m = mean(lengths);
  const cv = m > 0 ? std(lengths, m) / m : 1;
  return clamp((1 - cv) * 100);
}

function computePauseIndex(samples: number[]): number {
  const N = samples.length;
  if (N < 4) return 50;
  let silentCount = 0; let longPauseCount = 0;
  let runLen = 0; let inSilence = false;
  for (const v of samples) {
    if (v < SILENCE_DB) { silentCount++; inSilence = true; runLen++; }
    else { if (inSilence && runLen >= 7) longPauseCount++; inSilence = false; runLen = 0; }
  }
  if (inSilence && runLen >= 7) longPauseCount++;
  return clamp(silentCount / N * 60 + Math.min(1, longPauseCount / 3) * 40);
}

function computeVoiceCoherence(loud: number[], m: number): number {
  const n = loud.length;
  if (n < 6) return 50;
  const k = Math.min(3, Math.floor(n / 3));
  let num = 0; let den = 0;
  for (let i = 0; i < n - k; i++) num += (loud[i]! - m) * (loud[i + k]! - m);
  for (let i = 0; i < n; i++) den += (loud[i]! - m) ** 2;
  const r = den > 0 ? num / den : 0;
  return clamp(50 + r * 50);
}

// ─────────────────────────────────────────────────────────────────────────────

export function voiceSampleQuality(meterDb: number[], durationMs: number): VoiceSampleQuality {
  const samples = meterDb.filter((v) => isFinite(v));
  const finiteSamples = samples.length;
  const activeRatio = finiteSamples ? samples.filter((v) => v > ACTIVITY_DB).length / finiteSamples : 0;
  const rangeDb = finiteSamples ? Math.max(...samples) - Math.min(...samples) : 0;

  if (durationMs < 3000) return { usable: false, reason: 'too-short', finiteSamples, activeRatio, rangeDb };
  if (finiteSamples < 8) return { usable: false, reason: 'too-few-samples', finiteSamples, activeRatio, rangeDb };
  if (activeRatio < 0.12) return { usable: false, reason: 'mostly-silent', finiteSamples, activeRatio, rangeDb };
  if (rangeDb < 1.5) return { usable: false, reason: 'flat-signal', finiteSamples, activeRatio, rangeDb };
  return { usable: true, reason: 'ok', finiteSamples, activeRatio, rangeDb };
}

export function analyzeVoice(meterDb: number[], durationMs: number): Affect | null {
  const quality = voiceSampleQuality(meterDb, durationMs);
  if (!quality.usable) return null;

  const samples = meterDb.filter((v) => isFinite(v));
  const loud = samples.map(norm);
  const m = mean(loud);
  const variability = std(loud, m);
  const pauseRatio = samples.filter((v) => v < SILENCE_DB).length / samples.length;
  const seconds = Math.max(1, durationMs / 1000);
  const peaks = countPeaks(loud, m + variability * 0.4);
  const rate = peaks / seconds;

  const meanN = clamp01(m);
  const varN = clamp01(variability / 0.35);
  const rateN = clamp01(rate / 3.5);
  const pauseN = clamp01(pauseRatio / 0.6);

  const energy = clamp(Math.round((meanN * 0.45 + rateN * 0.35 + (1 - pauseN) * 0.20) * 100));
  const calmness = clamp(Math.round(((1 - varN) * 0.40 + pauseN * 0.30 + (1 - meanN) * 0.30) * 100));
  const stability = clamp(Math.round(((1 - varN) * 0.55 + (1 - Math.abs(m - 0.45)) * 0.45) * 100));

  const arousal = clamp01(meanN * 0.40 + rateN * 0.35 + varN * 0.25) * 2 - 1;
  const valence = clamp01(calmness / 100 * 0.45 + energy / 100 * 0.35 + stability / 100 * 0.20) * 2 - 1;

  const stress: StressLevel = energy > 70 && calmness < 40 ? 'Elevated'
    : energy > 55 || calmness < 55 ? 'Mild'
    : 'Low';

  const confidence = clamp01(0.3 + quality.finiteSamples / 60 * 0.4 + quality.activeRatio * 0.3);
  const emotionMatch = matchEmotion(valence, arousal, confidence);

  const voiceFeatures: VoiceFeatures = {
    shimmer: computeShimmer(loud),
    temporalEntropy: computeTemporalEntropy(loud),
    prosodicSlope: computeProsodicSlope(loud),
    burstRegularity: computeBurstRegularity(loud, norm(ACTIVITY_DB)),
    pauseIndex: computePauseIndex(samples),
    voiceCoherence: computeVoiceCoherence(loud, m),
  };

  return {
    valence,
    arousal,
    energy,
    calmness,
    stability,
    stress,
    confidence: emotionMatch.confidence,
    voiceEmotion: emotionMatch.primary.id,
    tone: emotionMatch.primary.label,
    voiceFeatures,
  };
}

export function baselineShift(
  now: { valence: number; arousal: number },
  baseline?: Baseline | null,
): number {
  if (!baseline) return 0;
  const nowScore = now.valence * 0.6 - Math.max(0, now.arousal) * 0.4;
  const baseScore = (baseline.valence ?? 0) * 0.6 - Math.max(0, baseline.arousal ?? 0) * 0.4;
  return Math.round(clamp((nowScore - baseScore) * 100, -100, 100));
}

export function buildCheckIn(opts: {
  affect: Affect;
  baseline?: Baseline | null;
  selfEmotion?: string;
  note?: string;
  factors?: string[];
}): CheckIn {
  const { affect, baseline: b, selfEmotion, note, factors } = opts;
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
    baselineShift: baselineShift(affect, b),
    note,
    factors,
    source: 'voice',
    voiceFeatures: affect.voiceFeatures,
  };
}

export function buildSelfCheckIn(
  emotionId: string,
  note?: string,
  factors?: string[],
): CheckIn {
  const emotion = getEmotion(emotionId);
  return {
    id: Math.random().toString(36).slice(2),
    at: Date.now(),
    valence: emotion.valence,
    arousal: emotion.arousal,
    energy: Math.round(clamp(50 + emotion.arousal * 45)),
    calmness: Math.round(clamp(52 - emotion.arousal * 38 + emotion.valence * 22)),
    stability: 70,
    stress: emotion.valence < -0.3 && emotion.arousal > 0.3 ? 'Elevated'
      : emotion.arousal > 0.3 ? 'Mild'
      : 'Low',
    confidence: 1,
    voiceEmotion: emotion.id,
    selfEmotion: emotion.id,
    emotion: emotion.id,
    tone: emotion.label,
    baselineShift: 0,
    note,
    factors,
    source: 'self',
  };
}
