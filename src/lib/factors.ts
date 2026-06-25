// Context factors a user can tag on a check-in — the raw material for correlations
// ("sleep ↔ calm", "exercise ↔ energy"). Kept small and concrete.
import type { Ionicons } from '@expo/vector-icons';

export interface Factor {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const FACTORS: Factor[] = [
  { id: 'sleep', label: 'Sleep', icon: 'moon-outline' },
  { id: 'work', label: 'Work', icon: 'briefcase-outline' },
  { id: 'exercise', label: 'Exercise', icon: 'walk-outline' },
  { id: 'social', label: 'Social', icon: 'people-outline' },
  { id: 'family', label: 'Family', icon: 'home-outline' },
  { id: 'alone', label: 'Alone time', icon: 'person-outline' },
  { id: 'outdoors', label: 'Outdoors', icon: 'leaf-outline' },
  { id: 'food', label: 'Food', icon: 'restaurant-outline' },
  { id: 'health', label: 'Health', icon: 'fitness-outline' },
  { id: 'money', label: 'Money', icon: 'card-outline' },
  { id: 'screens', label: 'Screens', icon: 'phone-portrait-outline' },
  { id: 'rest', label: 'Rest', icon: 'bed-outline' },
];

export const FACTOR_BY_ID: Record<string, Factor> = Object.fromEntries(FACTORS.map((f) => [f.id, f]));

export function factorLabel(id: string): string {
  return FACTOR_BY_ID[id]?.label ?? id;
}
