// The MoodSignal emotion model — 12 named emotions placed on a Valence × Arousal
// map (Russell's circumplex). This is the scientific backbone: voice and self-report
// both resolve to a point on the map, and we name the nearest emotion(s) with a
// confidence. Naming the feeling ("emotional granularity") is itself therapeutic.
import { colors } from '../theme/theme';

export interface Emotion {
  id: string;
  label: string;
  valence: number; // -1 (unpleasant) .. 1 (pleasant)
  arousal: number; // -1 (calm) .. 1 (activated)
  color: string;
  blurb: string;
  nuance: string[]; // finer-grained words for granularity
  practice: { label: string; route: string };
}

// route targets reuse existing practice screens.
const BREATH = { label: 'Breath reset', route: '/breath' };
const STILL = { label: 'Stillness', route: '/stillness' };
const META = { label: 'Loving-kindness', route: '/meta' };
const SOUND = { label: 'Calming sound', route: '/sound' };

export const EMOTIONS: Emotion[] = [
  // High arousal · positive
  { id: 'joy', label: 'Joyful', valence: 0.8, arousal: 0.65, color: '#f5c451', blurb: 'Bright and uplifted.', nuance: ['happy', 'delighted', 'playful', 'elated'], practice: SOUND },
  { id: 'excited', label: 'Excited', valence: 0.6, arousal: 0.9, color: '#ff9d5c', blurb: 'Energized and eager.', nuance: ['eager', 'enthusiastic', 'inspired', 'thrilled'], practice: BREATH },
  { id: 'proud', label: 'Proud', valence: 0.72, arousal: 0.35, color: '#9fc16f', blurb: 'Quietly accomplished.', nuance: ['confident', 'capable', 'fulfilled', 'strong'], practice: META },
  // Low arousal · positive
  { id: 'grateful', label: 'Grateful', valence: 0.85, arousal: -0.05, color: '#b6d97a', blurb: 'Warm and appreciative.', nuance: ['thankful', 'moved', 'blessed', 'tender'], practice: META },
  { id: 'content', label: 'Content', valence: 0.7, arousal: -0.35, color: '#5ec8b0', blurb: 'Settled and at ease.', nuance: ['at ease', 'satisfied', 'comfortable', 'secure'], practice: STILL },
  { id: 'calm', label: 'Calm', valence: 0.55, arousal: -0.65, color: '#66e0ca', blurb: 'Steady and quiet.', nuance: ['relaxed', 'peaceful', 'grounded', 'serene'], practice: STILL },
  // High arousal · negative
  { id: 'overwhelmed', label: 'Overwhelmed', valence: -0.4, arousal: 0.9, color: '#b07bff', blurb: 'Too much, all at once.', nuance: ['stretched', 'flooded', 'pressured', 'frazzled'], practice: BREATH },
  { id: 'anxious', label: 'Anxious', valence: -0.5, arousal: 0.75, color: '#ef786c', blurb: 'Tense and on edge.', nuance: ['worried', 'nervous', 'restless', 'uneasy'], practice: BREATH },
  { id: 'frustrated', label: 'Frustrated', valence: -0.65, arousal: 0.55, color: '#e8615c', blurb: 'Blocked and irritable.', nuance: ['annoyed', 'irritated', 'angry', 'impatient'], practice: BREATH },
  // Low arousal · negative
  { id: 'sad', label: 'Sad', valence: -0.7, arousal: -0.4, color: '#7db9ff', blurb: 'Heavy and low.', nuance: ['down', 'blue', 'disappointed', 'hurt'], practice: META },
  { id: 'lonely', label: 'Lonely', valence: -0.6, arousal: -0.2, color: '#b6a7ff', blurb: 'Disconnected from others.', nuance: ['isolated', 'unseen', 'distant', 'left out'], practice: META },
  { id: 'drained', label: 'Drained', valence: -0.3, arousal: -0.7, color: '#8aa0b8', blurb: 'Low energy, depleted.', nuance: ['tired', 'flat', 'numb', 'foggy'], practice: STILL },
];

export const EMOTION_BY_ID: Record<string, Emotion> = Object.fromEntries(
  EMOTIONS.map((e) => [e.id, e])
);

export function getEmotion(id: string | undefined | null): Emotion {
  return (id && EMOTION_BY_ID[id]) || EMOTION_BY_ID.calm;
}

function dist(a: { valence: number; arousal: number }, e: Emotion): number {
  const dv = a.valence - e.valence;
  const da = a.arousal - e.arousal;
  return Math.sqrt(dv * dv + da * da);
}

export interface EmotionMatch {
  primary: Emotion;
  secondary: Emotion[];
  confidence: number; // 0..1
}

/** Resolve a valence/arousal point to the nearest named emotion(s) + confidence. */
export function matchEmotion(valence: number, arousal: number, baseConfidence = 1): EmotionMatch {
  const ranked = EMOTIONS.map((e) => ({ e, d: dist({ valence, arousal }, e) })).sort((a, b) => a.d - b.d);
  const primary = ranked[0].e;
  // secondary: other emotions within a small radius of the point
  const secondary = ranked.slice(1, 3).filter((r) => r.d < 0.7).map((r) => r.e);
  // confidence: close to a single emotion AND well-separated from the next = confident
  const nearest = ranked[0].d;
  const next = ranked[1].d;
  const closeness = Math.max(0, 1 - nearest / 1.6); // 0..1
  const separation = Math.max(0, Math.min(1, (next - nearest) / 0.6)); // 0..1
  const confidence = Math.max(0.1, Math.min(1, baseConfidence * (0.55 * closeness + 0.45 * separation)));
  return { primary, secondary, confidence };
}

// Quadrant helpers for the wheel layout.
export function quadrantLabel(valence: number, arousal: number): string {
  if (arousal >= 0 && valence >= 0) return 'High energy · pleasant';
  if (arousal >= 0 && valence < 0) return 'High energy · unpleasant';
  if (arousal < 0 && valence >= 0) return 'Low energy · pleasant';
  return 'Low energy · unpleasant';
}
