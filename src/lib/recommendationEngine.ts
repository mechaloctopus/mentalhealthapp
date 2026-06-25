import { getEmotion } from './emotions';
import type { Baseline, CheckIn, Recommendation, StressLevel } from './voice';
import { pickPurposePrompt, type PurposePrompt } from './purposeEngine';
import { pickWisdom, type WisdomEntry } from '../data/wisdom';

export interface RecommendationInput {
  emotionId: string;
  stress: StressLevel;
  energy: number;
  calmness: number;
  stability: number;
  baseline?: Baseline | null;
  baselineShift?: number;
  factors?: string[];
  recentCheckins?: CheckIn[];
  recentPracticeRoutes?: string[];
  now?: Date;
}

export interface NextStepRecommendation extends Recommendation {
  durationMinutes: number;
  category: 'regulate' | 'restore' | 'connect' | 'focus' | 'purpose' | 'integrate';
  wisdom: WisdomEntry;
  purpose: PurposePrompt;
  rationale: string;
  alternate?: Recommendation;
}

const ROUTES = {
  breath: { practice: 'Breath reset', route: '/breath', reason: 'A slower exhale helps your system come out of high activation.' },
  stillness: { practice: 'Stillness', route: '/stillness', reason: 'A quiet body scan can restore energy without asking much from you.' },
  meta: { practice: 'Loving-kindness', route: '/meta', reason: 'Connection softens the edges of sadness, loneliness, and frustration.' },
  sound: { practice: 'Calming sound', route: '/sound', reason: 'A simple sound field can give your attention somewhere steady to rest.' },
} satisfies Record<string, Recommendation>;

function recentlyUsed(route: string, recentPracticeRoutes?: string[]): boolean {
  return Boolean(recentPracticeRoutes?.slice(0, 2).includes(route));
}

function fallbackForEmotion(emotionId: string): Recommendation {
  const emotion = getEmotion(emotionId);
  return {
    practice: emotion.practice.label,
    route: emotion.practice.route,
    reason: `This matches your ${emotion.label.toLowerCase()} signal with one grounded next step.`,
  };
}

function choosePractice(input: RecommendationInput): { primary: Recommendation; alternate: Recommendation; category: NextStepRecommendation['category']; durationMinutes: number } {
  const { emotionId, stress, energy, calmness, stability, baselineShift = 0, recentPracticeRoutes } = input;

  let primary: Recommendation;
  let alternate: Recommendation = fallbackForEmotion(emotionId);
  let category: NextStepRecommendation['category'] = 'regulate';
  let durationMinutes = 5;

  if (stress === 'Elevated' || calmness < 35) {
    primary = ROUTES.breath;
    alternate = ROUTES.stillness;
    category = 'regulate';
    durationMinutes = 3;
  } else if (energy < 35 || emotionId === 'drained') {
    primary = ROUTES.stillness;
    alternate = ROUTES.sound;
    category = 'restore';
    durationMinutes = 7;
  } else if (emotionId === 'lonely' || emotionId === 'sad' || emotionId === 'frustrated') {
    primary = ROUTES.meta;
    alternate = ROUTES.breath;
    category = 'connect';
    durationMinutes = 6;
  } else if (stability < 45 || baselineShift < -25) {
    primary = ROUTES.stillness;
    alternate = ROUTES.breath;
    category = 'restore';
    durationMinutes = 5;
  } else if (emotionId === 'joy' || emotionId === 'grateful' || emotionId === 'content' || emotionId === 'proud') {
    primary = ROUTES.sound;
    alternate = ROUTES.meta;
    category = 'integrate';
    durationMinutes = 5;
  } else {
    primary = fallbackForEmotion(emotionId);
    alternate = ROUTES.stillness;
    category = 'focus';
    durationMinutes = 5;
  }

  if (recentlyUsed(primary.route, recentPracticeRoutes) && alternate.route !== primary.route) {
    return { primary: alternate, alternate: primary, category, durationMinutes };
  }

  return { primary, alternate, category, durationMinutes };
}

function rationaleFor(input: RecommendationInput, category: NextStepRecommendation['category']): string {
  const emotion = getEmotion(input.emotionId).label.toLowerCase();
  if (input.stress === 'Elevated') return `Your ${emotion} signal looks activated, so the first move is regulation, not analysis.`;
  if (input.energy < 35) return `Your energy looks low, so the next step should restore rather than demand more effort.`;
  if (input.calmness < 35) return `Your calmness is low, so a short settling practice is the highest-leverage move.`;
  if ((input.baselineShift ?? 0) < -25) return `You are below baseline, so the goal is a small stabilizing action.`;
  if (category === 'integrate') return `This is a good state to savor and integrate instead of rushing past it.`;
  return `This matches your current ${emotion} signal with one grounded next step.`;
}

export function recommendNextStep(input: RecommendationInput): NextStepRecommendation {
  const seed = Math.round((input.now ?? new Date()).getTime() / 60000) + input.energy + input.calmness;
  const { primary, alternate, category, durationMinutes } = choosePractice(input);
  const wisdom = pickWisdom(input.emotionId, seed);
  const purpose = pickPurposePrompt(input.emotionId, seed);

  return {
    ...primary,
    durationMinutes,
    category,
    wisdom,
    purpose,
    rationale: rationaleFor(input, category),
    alternate,
  };
}

export function recommendationFromCheckIn(checkin: CheckIn, opts?: { baseline?: Baseline | null; recentCheckins?: CheckIn[]; recentPracticeRoutes?: string[] }): NextStepRecommendation {
  return recommendNextStep({
    emotionId: checkin.emotion,
    stress: checkin.stress,
    energy: checkin.energy,
    calmness: checkin.calmness,
    stability: checkin.stability,
    baseline: opts?.baseline,
    baselineShift: checkin.baselineShift,
    factors: checkin.factors,
    recentCheckins: opts?.recentCheckins,
    recentPracticeRoutes: opts?.recentPracticeRoutes,
  });
}
