// The 12-emotion model — valence × arousal (Russell's circumplex), expanded for v2.
// Each emotion carries mapped activities per the product spec.

import { colors } from '../theme/tokens';

export interface EmotionActivity {
  id: string;
  label: string;
  route: string;
  resonance: number;
  attributes: string[];
}

export interface Emotion {
  id: string;
  label: string;
  valence: number;   // -1 unpleasant .. 1 pleasant
  arousal: number;   // -1 calm .. 1 activated
  color: string;
  blurb: string;
  nuance: string[];
  inverse: boolean;  // true = "unpleasant" emotions we want to reduce
  activities: EmotionActivity[];
}

const a = (id: string, label: string, route: string, res = 10, attrs: string[] = []): EmotionActivity =>
  ({ id, label, route, resonance: res, attributes: attrs });

export const EMOTIONS: Emotion[] = [
  {
    id: 'joy',
    label: 'Joy',
    valence: 0.8, arousal: 0.65,
    color: '#f5c451',
    blurb: 'Bright and uplifted.',
    nuance: ['happy', 'delighted', 'playful', 'elated'],
    inverse: false,
    activities: [
      a('savor', 'Savoring practice', '/practices/stillness', 10, ['Mindfulness']),
      a('gratitude-joy', 'Gratitude capture', '/(tabs)/journal/reflect', 10, ['Wisdom']),
      a('share-win', 'Share-a-win journal', '/(tabs)/journal/write', 8, ['Relationships']),
      a('sound-joy', 'Uplift soundscape', '/practices/sound', 8, ['Flow']),
    ],
  },
  {
    id: 'calm',
    label: 'Calm',
    valence: 0.55, arousal: -0.65,
    color: colors.teal,
    blurb: 'Steady and quiet.',
    nuance: ['relaxed', 'peaceful', 'grounded', 'serene'],
    inverse: false,
    activities: [
      a('body-scan', 'Body scan', '/practices/stillness', 10, ['Mindfulness']),
      a('exhale-calm', 'Extended exhale', '/practices/breath', 8, ['Mindfulness']),
      a('sleep-sound', 'Sleep soundscape', '/practices/sleep', 8, ['Flow']),
      a('journal-calm', 'Still reflection', '/(tabs)/journal/write', 8, ['Wisdom']),
    ],
  },
  {
    id: 'energy',
    label: 'Energy',
    valence: 0.7, arousal: 0.8,
    color: '#ff9d5c',
    blurb: 'Activated and vital.',
    nuance: ['alive', 'energized', 'motivated', 'ready'],
    inverse: false,
    activities: [
      a('movement', 'Movement quest', '/(tabs)/journey/quest', 12, ['Fitness']),
      a('activation-breath', 'Activation breath', '/practices/breath', 10, ['Fitness']),
      a('flow-sprint', 'Single-task sprint', '/(tabs)/journey/quest', 10, ['Flow']),
      a('sound-energy', 'Energizing sound', '/practices/sound', 8, ['Flow']),
    ],
  },
  {
    id: 'confidence',
    label: 'Confidence',
    valence: 0.72, arousal: 0.35,
    color: colors.moss,
    blurb: 'Quietly accomplished.',
    nuance: ['capable', 'strong', 'assured', 'grounded'],
    inverse: false,
    activities: [
      a('strengths', 'Strengths reflection', '/(tabs)/journal/reflect', 10, ['Wisdom', 'Leadership']),
      a('small-win', 'Small-win quest', '/(tabs)/journey/quest', 10, ['Purpose']),
      a('power-posture', 'Power posture practice', '/practices/stillness', 8, ['Fitness']),
      a('meta-conf', 'Loving-kindness', '/practices/loving-kindness', 8, ['Compassion']),
    ],
  },
  {
    id: 'gratitude',
    label: 'Gratitude',
    valence: 0.85, arousal: -0.05,
    color: '#b6d97a',
    blurb: 'Warm and appreciative.',
    nuance: ['thankful', 'moved', 'blessed', 'tender'],
    inverse: false,
    activities: [
      a('three-good', 'Three good things', '/(tabs)/journal/reflect', 10, ['Wisdom']),
      a('thanks-letter', 'Letter of thanks', '/(tabs)/journal/write', 12, ['Relationships', 'Compassion']),
      a('appreciation-quest', 'Appreciation quest', '/(tabs)/journey/quest', 10, ['Service']),
      a('meta-grat', 'Loving-kindness', '/practices/loving-kindness', 10, ['Compassion']),
    ],
  },
  {
    id: 'connection',
    label: 'Connection',
    valence: 0.7, arousal: 0.1,
    color: colors.lavender,
    blurb: 'Warm and close.',
    nuance: ['loved', 'seen', 'belonging', 'close'],
    inverse: false,
    activities: [
      a('meta-conn', 'Loving-kindness practice', '/practices/loving-kindness', 12, ['Compassion', 'Relationships']),
      a('reach-out', 'Reach-out quest', '/(tabs)/journey/quest', 10, ['Relationships', 'Service']),
      a('compassion-j', 'Compassion journal', '/(tabs)/journal/reflect', 10, ['Compassion']),
      a('sound-conn', 'Warm soundscape', '/practices/sound', 8, ['Flow']),
    ],
  },
  {
    id: 'focus',
    label: 'Focus',
    valence: 0.6, arousal: 0.4,
    color: colors.blue,
    blurb: 'Clear and in the zone.',
    nuance: ['sharp', 'absorbed', 'clear', 'present'],
    inverse: false,
    activities: [
      a('sprint', 'Single-task sprint', '/(tabs)/journey/quest', 10, ['Flow', 'Leadership']),
      a('sound-focus', 'Focus soundscape', '/practices/sound', 8, ['Flow']),
      a('flow-quest', 'Flow-state quest', '/(tabs)/journey/quest', 12, ['Flow', 'Creativity']),
      a('breath-focus', 'Breath anchor', '/practices/breath', 8, ['Mindfulness']),
    ],
  },
  {
    id: 'hope',
    label: 'Hope',
    valence: 0.65, arousal: 0.2,
    color: colors.amber,
    blurb: 'Open and forward-looking.',
    nuance: ['expectant', 'purposeful', 'optimistic', 'inspired'],
    inverse: false,
    activities: [
      a('purpose-prompt', 'Purpose-through-care prompt', '/(tabs)/journal/reflect', 12, ['Purpose', 'Wisdom']),
      a('wisdom-step', 'Wisdom path step', '/(tabs)/journey', 10, ['Wisdom']),
      a('mission-review', 'Mission review', '/(tabs)/journey', 10, ['Purpose', 'Leadership']),
      a('meta-hope', 'Loving-kindness', '/practices/loving-kindness', 8, ['Compassion']),
    ],
  },
  {
    id: 'stress',
    label: 'Stress',
    valence: -0.5, arousal: 0.75,
    color: colors.coral,
    blurb: 'Tense and overwhelmed.',
    nuance: ['pressured', 'flooded', 'frazzled', 'tightly wound'],
    inverse: true,
    activities: [
      a('box-breath', 'Box breathing', '/practices/breath', 10, ['Mindfulness']),
      a('brain-dump', 'Brain-dump journal', '/(tabs)/journal/write', 8, ['Wisdom']),
      a('stillness-stress', 'Stillness', '/practices/stillness', 10, ['Mindfulness']),
      a('sound-stress', 'Calming sound', '/practices/sound', 8, ['Flow']),
    ],
  },
  {
    id: 'sadness',
    label: 'Sadness',
    valence: -0.7, arousal: -0.4,
    color: '#7db9ff',
    blurb: 'Heavy and low.',
    nuance: ['down', 'blue', 'disappointed', 'hurt', 'grief'],
    inverse: true,
    activities: [
      a('activation', 'Behavioral-activation quest', '/(tabs)/journey/quest', 10, ['Fitness', 'Purpose']),
      a('reflection-sad', 'Guided reflection', '/(tabs)/journal/reflect', 10, ['Wisdom']),
      a('movement-sad', 'Gentle movement', '/(tabs)/journey/quest', 8, ['Fitness']),
      a('meta-sad', 'Loving-kindness', '/practices/loving-kindness', 12, ['Compassion']),
    ],
  },
  {
    id: 'anxiety',
    label: 'Anxiety',
    valence: -0.5, arousal: 0.8,
    color: '#b07bff',
    blurb: 'On edge and worried.',
    nuance: ['nervous', 'worried', 'restless', 'uneasy', 'apprehensive'],
    inverse: true,
    activities: [
      a('grounding', 'Grounding 5-4-3-2-1', '/practices/stillness', 10, ['Mindfulness']),
      a('paced-breath', 'Paced breathing', '/practices/breath', 10, ['Mindfulness']),
      a('reframe', 'Worry-reframe coach', '/(tabs)/journal/reflect', 10, ['Wisdom']),
      a('sound-anxiety', 'Calming sound', '/practices/sound', 8, ['Flow']),
    ],
  },
  {
    id: 'anger',
    label: 'Anger',
    valence: -0.65, arousal: 0.6,
    color: '#e8615c',
    blurb: 'Frustrated and reactive.',
    nuance: ['annoyed', 'irritated', 'furious', 'resentful'],
    inverse: true,
    activities: [
      a('discharge', 'Physical discharge quest', '/(tabs)/journey/quest', 10, ['Fitness']),
      a('cool-breath', 'Cooling breath', '/practices/breath', 10, ['Mindfulness']),
      a('reframe-anger', 'Reframe reflection', '/(tabs)/journal/reflect', 10, ['Wisdom']),
      a('still-anger', 'Stillness', '/practices/stillness', 8, ['Mindfulness']),
    ],
  },
];

export const EMOTION_BY_ID: Record<string, Emotion> = Object.fromEntries(
  EMOTIONS.map((e) => [e.id, e])
);

export function getEmotion(id: string | undefined | null): Emotion {
  return (id && EMOTION_BY_ID[id]) || EMOTION_BY_ID['calm']!;
}

function dist(a: { valence: number; arousal: number }, e: Emotion): number {
  const dv = a.valence - e.valence;
  const da = a.arousal - e.arousal;
  return Math.sqrt(dv * dv + da * da);
}

export interface EmotionMatch {
  primary: Emotion;
  secondary: Emotion[];
  confidence: number;
}

export function matchEmotion(valence: number, arousal: number, baseConfidence = 1): EmotionMatch {
  const ranked = EMOTIONS.map((e) => ({ e, d: dist({ valence, arousal }, e) })).sort((a, b) => a.d - b.d);
  const primary = ranked[0]!.e;
  const secondary = ranked.slice(1, 3).filter((r) => r.d < 0.7).map((r) => r.e);
  const nearest = ranked[0]!.d;
  const next = ranked[1]!.d;
  const closeness = Math.max(0, 1 - nearest / 1.6);
  const separation = Math.max(0, Math.min(1, (next - nearest) / 0.6));
  const confidence = Math.max(0.1, Math.min(1, baseConfidence * (0.55 * closeness + 0.45 * separation)));
  return { primary, secondary, confidence };
}

// Returns all 12 emotions ranked by proximity to the voice analysis point,
// with a 0–100 score where 100 = exact match.
export function rankEmotions(valence: number, arousal: number): Array<{ emotion: Emotion; score: number }> {
  const MAX_DIST = Math.sqrt(8); // max possible distance in a −1..1 × −1..1 space
  return EMOTIONS
    .map((e) => ({ emotion: e, d: dist({ valence, arousal }, e) }))
    .sort((a, b) => a.d - b.d)
    .map(({ emotion, d }) => ({ emotion, score: Math.max(0, Math.round((1 - d / MAX_DIST) * 100)) }));
}
