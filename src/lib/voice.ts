// On-device voice affect estimation from the microphone loudness envelope.
// This is a reflective wellness signal, not a clinical or diagnostic model.
import { matchEmotion, getEmotion, type Emotion } from './emotions';

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
  emotion: string;
  tone: string;
  baselineShift: number;
  note?: string;
  source: 'voice' | 'self';
  factors?: string[];
  recommendation: Recommendation;
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
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function countPeaks(loud: number[], threshold: number): number {
  let peaks = 0;
  for (let index = 1; index < loud.length - 1; index++) {
    if (loud[index] > threshold && loud[index] >= loud[index - 1] && loud[index] > loud[index + 1]) peaks++;
  }
  return peaks;
}

export function voiceSampleQuality(meterDb: number[], durationMs: number): VoiceSampleQuality {
  const samples = meterDb.filter((value) => isFinite(value));
  const finiteSamples = samples.length;
  const activeRatio = finiteSamples ? samples.filter((value) => value > ACTIVITY_DB).length / finiteSamples : 0;
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

  const samples = meterDb.filter((value) => isFinite(value));
  const loud = samples.map(norm);
  const mean = loud.reduce((sum, value) => sum + value, 0) / loud.length;
  const variability = std(loud, mean);
  const pauseRatio = samples.filter((value) => value < SILENCE_DB).length / samples.length;
  const seconds = Math.max(1, durationMs / 1000);
  const peaks = countPeaks(loud, mean + variability * 0.4);
  const rate = peaks / seconds;

  const meanN = clamp01(mean);
  const varN = clamp01(variability / 0.35);
  const rateN = clamp01(rate / 4);
  const engagement = 1 - pauseRatio;
  const steadiness = 1 - varN;
  const arousal01 = clamp01(0.5 * meanN + 0.3 * varN + 0.2 * rateN);
  const arousal = arousal01 * 2 - 1;
  const agitation = varN * arousal01;
  const flatLow = Math.max(0, 0.4 - meanN);
  const valence01 = clamp01(0.5 + 0.3 * (steadiness - 0.5) + 0.18 * (engagement - 0.5) - 0.45 * agitation - 0.3 * flatLow);
  const valence = valence01 * 2 - 1;
  const energy = Math.round(clamp(50 + arousal * 45 + meanN * 8 - 4));
  const calmness = Math.round(clamp(52 - arousal * 38 + valence * 22));
  const stability = Math.round(clamp(100 - varN * 72));
  const stressScore = Math.max(0, arousal) * 0.6 + Math.max(0, -valence) * 0.5;
  const stress: StressLevel = stressScore > 0.55 ? 'Elevated' : stressScore > 0.3 ? 'Mild' : 'Low';
  const sampleStrength = clamp01((quality.finiteSamples / 30) * 0.45 + quality.activeRatio * 0.35 + clamp01(quality.rangeDb / 18) * 0.2);
  const baseConfidence = (0.42 + 0.16 * Math.abs(arousal)) * (0.65 + sampleStrength * 0.35);
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
    overwhelmed: 'A longer exhale creates room to slow down.',
    anxious: 'Paced breathing can support a steadier rhythm.',
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
    recommendation: recommendFor(finalEmotion),
  };
}

export function buildSelfCheckIn(emotionId: string, note?: string, factors?: string[]): CheckIn {
  const emotion = getEmotion(emotionId);
  return {
    id: Math.random().toString(36).slice(2),
    at: Date.now(),
    valence: emotion.valence,
    arousal: emotion.arousal,
    energy: Math.round(clamp(50 + emotion.arousal * 45)),
    calmness: Math.round(clamp(52 - emotion.arousal * 38 + emotion.valence * 22)),
    stability: 70,
    stress: emotion.valence < -0.3 && emotion.arousal > 0.3 ? 'Elevated' : emotion.arousal > 0.3 ? 'Mild' : 'Low',
    confidence: 1,
    voiceEmotion: emotion.id,
    selfEmotion: emotion.id,
    emotion: emotion.id,
    tone: emotion.label,
    baselineShift: 0,
    note,
    factors,
    source: 'self',
    recommendation: recommendFor(emotion),
  };
}
