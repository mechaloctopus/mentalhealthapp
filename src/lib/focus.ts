// Onboarding goals — used to personalize the home screen, suggestions, and tone.
import type { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

export interface FocusGoal {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  suggest: { label: string; route: string; reason: string };
}

export const GOALS: FocusGoal[] = [
  { id: 'calm', label: 'A calmer mind', icon: 'leaf', color: colors.teal, suggest: { label: 'Breathe', route: '/breath', reason: 'A minute of paced breath is the fastest way to settle.' } },
  { id: 'anxiety', label: 'Ease anxiety', icon: 'pulse', color: colors.coral, suggest: { label: 'Breath reset', route: '/breath', reason: 'A longer exhale tells your body it’s safe.' } },
  { id: 'sleep', label: 'Better sleep', icon: 'moon', color: colors.blue, suggest: { label: 'Sleep mixer', route: '/sleep', reason: 'Wind down with a layered soundscape.' } },
  { id: 'mood', label: 'Understand my moods', icon: 'analytics', color: colors.amber, suggest: { label: 'Voice check-in', route: '/checkin', reason: 'A 60-second check-in reveals how you’re arriving.' } },
  { id: 'habits', label: 'Build better habits', icon: 'repeat', color: colors.moss, suggest: { label: 'The Inner Path', route: '/side', reason: 'Small daily quests that quietly add up.' } },
  { id: 'purpose', label: 'Find more purpose', icon: 'compass', color: colors.violet, suggest: { label: 'Acts of stewardship', route: '/side/path/purpose', reason: 'Purpose is practiced — start with one small act.' } },
  { id: 'lonely', label: 'Feel less alone', icon: 'heart', color: colors.lavender, suggest: { label: 'Loving-kindness', route: '/meta', reason: 'A warm practice that widens the circle.' } },
  { id: 'grow', label: 'Grow & learn', icon: 'sparkles', color: colors.indigo, suggest: { label: 'Wisdom Library', route: '/side/path/library', reason: 'Tiny lessons you can actually live.' } },
];

export const GOAL_BY_ID: Record<string, FocusGoal> = Object.fromEntries(GOALS.map((g) => [g.id, g]));

/** Pick the primary tailored suggestion for the user's chosen goals. */
export function primarySuggestion(focus: string[]): FocusGoal['suggest'] | null {
  const first = focus.map((id) => GOAL_BY_ID[id]).find(Boolean);
  return first ? first.suggest : null;
}

export function focusLine(focus: string[]): string {
  if (focus.length === 0) return 'A gentle space to check in and grow.';
  const labels = focus.map((id) => GOAL_BY_ID[id]?.label.toLowerCase()).filter(Boolean);
  if (labels.length === 1) return `Here to help you toward ${labels[0]}.`;
  return `Here for ${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}.`;
}
