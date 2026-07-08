// Activity recommendation engine for MoodSignal v2.
// Given a check-in, selects the most resonant activity from the emotion's
// activity list and augments with a school-of-thought lesson.

import { getEmotion, EMOTION_BY_ID, type EmotionActivity } from '../content/emotions';
import { schoolsForEmotion, type SchoolLesson } from '../content/schools';
import type { CheckIn } from './voice';

export interface Recommendation {
  activity: EmotionActivity;
  rationale: string;
  lesson?: SchoolLesson;
  schoolName?: string;
}

function recentlyUsed(route: string, recents: string[]): boolean {
  return recents.slice(0, 2).includes(route);
}

export function recommend(
  checkin: Pick<CheckIn, 'emotion' | 'stress' | 'energy' | 'calmness'>,
  recentRoutes: string[] = [],
): Recommendation {
  const emotion = getEmotion(checkin.emotion);
  const activities = emotion.activities;

  // Score each activity by resonance, penalise recently used routes
  const scored = activities.map((act) => ({
    act,
    score: act.resonance - (recentlyUsed(act.route, recentRoutes) ? 4 : 0),
  }));

  // For high stress/anxiety boost breath and stillness
  if (checkin.stress === 'Elevated' || checkin.calmness < 35) {
    scored.forEach((s) => {
      if (s.act.route.includes('breath') || s.act.route.includes('stillness')) s.score += 3;
    });
  }

  // For low energy boost restorative practices
  if (checkin.energy < 35) {
    scored.forEach((s) => {
      if (s.act.route.includes('sleep') || s.act.route.includes('stillness')) s.score += 2;
    });
  }

  scored.sort((a, b) => b.score - a.score);
  const activity = scored[0]!.act;

  const rationale = buildRationale(checkin.emotion, activity);

  // Pick a school lesson if available
  const schools = schoolsForEmotion(checkin.emotion);
  let lesson: SchoolLesson | undefined;
  let schoolName: string | undefined;
  if (schools.length > 0) {
    const school = schools[Math.floor(Math.random() * schools.length)]!;
    lesson = school.lessons[Math.floor(Math.random() * school.lessons.length)];
    schoolName = school.name;
  }

  return { activity, rationale, lesson, schoolName };
}

function buildRationale(emotionId: string, activity: EmotionActivity): string {
  const emotion = getEmotion(emotionId);
  const rationaleMap: Record<string, string> = {
    joy:        'Let this moment land before moving on.',
    calm:       'A short practice helps the calm deepen.',
    energy:     'Channel the energy with something intentional.',
    confidence: 'Strengths grow when they are named and used.',
    gratitude:  'Gratitude practice extends the warmth outward.',
    connection: 'Connection softens the edges of isolation.',
    focus:      'One clear task, fully entered, beats scattered effort.',
    hope:       'Hope becomes real when it meets a small action.',
    stress:     'A slower exhale helps your system come down.',
    sadness:    'Gentle movement or connection can meet sadness with care.',
    anxiety:    'Grounding returns you to the present moment.',
    anger:      'Discharging the energy creates space for clarity.',
  };
  return rationaleMap[emotionId] ?? `This matches your ${emotion.label.toLowerCase()} signal.`;
}

export function recommendFromEmotion(
  emotionId: string,
  recentRoutes: string[] = [],
): Recommendation {
  return recommend(
    { emotion: emotionId, stress: 'Low', energy: 60, calmness: 60 },
    recentRoutes,
  );
}
