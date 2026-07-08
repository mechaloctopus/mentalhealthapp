// On-device voice affect estimation from the microphone loudness envelope.
// Reflective wellness signal only — not clinical or diagnostic.

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
}

export interface Baseline {
  energy: number;
  calmness: number;
  stability: number;
  valence: number;
  arousal: number;
  capturedAt: number;
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

function std(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function countPeaks(loud: number[], threshold: number): number {
  let peaks = 0;
  for (let i = 1; i < loud.length - 1; i++) {
    if (loud[i]! > threshold && loud[i]! >= loud[i - 1]! && loud[i]! > loud[i + 1]!) peaks++;
  }
  return peaks;
}

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
  const mean = loud.reduce((s, v) => s + v, 0) / loud.length;
  const variability = std(loud, mean);
  const pauseRatio = samples.filter((v) => v < SILENCE_DB).length / samples.length;
  const seconds = Math.max(1, durationMs / 1000);
  const peaks = countPeaks(loud, mean + variability * 0.4);
  const rate = peaks / seconds;

  const meanN = clamp01(mean);
  const varN = clamp01(variability / 0.35);
  const rateN = clamp01(rate / 3.5);
  const pauseN = clamp01(pauseRatio / 0.6);

  const energy = clamp(Math.round((meanN * 0.45 + rateN * 0.35 + (1 - pauseN) * 0.20) * 100));
  const calmness = clamp(Math.round(((1 - varN) * 0.40 + pauseN * 0.30 + (1 - meanN) * 0.30) * 100));
  const stability = clamp(Math.round(((1 - varN) * 0.55 + (1 - Math.abs(mean - 0.45)) * 0.45) * 100));

  const arousal = clamp01(meanN * 0.40 + rateN * 0.35 + varN * 0.25) * 2 - 1;
  const valence = clamp01(calmness / 100 * 0.45 + energy / 100 * 0.35 + stability / 100 * 0.20) * 2 - 1;

  const stress: StressLevel = energy > 70 && calmness < 40 ? 'Elevated'
    : energy > 55 || calmness < 55 ? 'Mild'
    : 'Low';

  const confidence = clamp01(0.3 + quality.finiteSamples / 60 * 0.4 + quality.activeRatio * 0.3);
  const match = matchEmotion(valence, arousal, confidence);

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
