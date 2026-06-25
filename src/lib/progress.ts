// Gentle gamification: self-care points → a growing companion ("Lumen"), levels,
// and milestone badges. Designed to encourage, never to shame.
import { computeStreak } from './insights';

export const POINTS = { checkin: 10, session: 8, journal: 6, coach: 12 } as const;

const LEVEL_NAMES = ['Spark', 'Ember', 'Glow', 'Flame', 'Beacon', 'Aurora', 'Lumen'];
const LEVEL_STEP = 90; // points per level

export interface Progress {
  points: number;
  level: number; // 1-based
  levelName: string;
  intoLevel: number; // points into current level
  levelSpan: number; // points needed for this level
  toNext: number;
  streak: number;
}

export interface Badge {
  id: string;
  label: string;
  icon: string; // Ionicons name
  earned: boolean;
}

export function computeProgress(args: {
  checkins: { at: number }[];
  sessions: { at: number; minutes: number }[];
  journal: { at: number }[];
}): Progress {
  const { checkins, sessions, journal } = args;
  const points =
    checkins.length * POINTS.checkin +
    sessions.length * POINTS.session +
    journal.length * POINTS.journal;
  const level = Math.min(LEVEL_NAMES.length, Math.floor(points / LEVEL_STEP) + 1);
  const intoLevel = points - (level - 1) * LEVEL_STEP;
  const levelSpan = LEVEL_STEP;
  const activity = [...checkins.map((c) => c.at), ...sessions.map((s) => s.at), ...journal.map((j) => j.at)];
  return {
    points,
    level,
    levelName: LEVEL_NAMES[level - 1],
    intoLevel,
    levelSpan,
    toNext: Math.max(0, levelSpan - intoLevel),
    streak: computeStreak(activity),
  };
}

export function computeBadges(args: {
  checkins: { at: number }[];
  sessions: { at: number }[];
  journal: { at: number; source?: string }[];
  streak: number;
}): Badge[] {
  const { checkins, sessions, journal, streak } = args;
  const coachCount = journal.filter((j) => j.source === 'coach').length;
  return [
    { id: 'first', label: 'First check-in', icon: 'leaf', earned: checkins.length >= 1 },
    { id: 'three', label: '3-day streak', icon: 'flame', earned: streak >= 3 },
    { id: 'seven', label: '7-day streak', icon: 'flame', earned: streak >= 7 },
    { id: 'ten', label: '10 check-ins', icon: 'mic', earned: checkins.length >= 10 },
    { id: 'journal', label: 'First journal', icon: 'book', earned: journal.length >= 1 },
    { id: 'coach', label: 'First reflection', icon: 'chatbubbles', earned: coachCount >= 1 },
    { id: 'calm', label: '5 practices', icon: 'flower', earned: sessions.length >= 5 },
    { id: 'devoted', label: '30 check-ins', icon: 'sparkles', earned: checkins.length >= 30 },
  ];
}
