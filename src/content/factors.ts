export interface Factor {
  id: string;
  label: string;
  emoji: string;
  category: 'body' | 'mind' | 'social' | 'world';
}

export const FACTORS: Factor[] = [
  // Body
  { id: 'good-sleep',   label: 'Good sleep',    emoji: '💤', category: 'body' },
  { id: 'poor-sleep',   label: 'Poor sleep',    emoji: '😩', category: 'body' },
  { id: 'exercise',     label: 'Exercise',      emoji: '🏃', category: 'body' },
  { id: 'nutrition',    label: 'Good meals',    emoji: '🥗', category: 'body' },
  { id: 'caffeine',     label: 'Caffeine',      emoji: '☕', category: 'body' },
  { id: 'alcohol',      label: 'Alcohol',       emoji: '🍷', category: 'body' },
  // Mind
  { id: 'meditation',   label: 'Meditation',    emoji: '◉',  category: 'mind' },
  { id: 'creative',     label: 'Creative work', emoji: '✦',  category: 'mind' },
  { id: 'screens',      label: 'Too much screen', emoji: '📱', category: 'mind' },
  { id: 'gratitude',    label: 'Gratitude',     emoji: '✧',  category: 'mind' },
  // Social
  { id: 'social',       label: 'Good connection', emoji: '♡', category: 'social' },
  { id: 'conflict',     label: 'Conflict',      emoji: '⚡', category: 'social' },
  { id: 'work-stress',  label: 'Work stress',   emoji: '💼', category: 'social' },
  // World
  { id: 'nature',       label: 'Time in nature', emoji: '🌿', category: 'world' },
  { id: 'music',        label: 'Music',         emoji: '♪',  category: 'world' },
  { id: 'news',         label: 'Heavy news',    emoji: '📰', category: 'world' },
];

export const FACTOR_MAP: Record<string, Factor> = Object.fromEntries(
  FACTORS.map((f) => [f.id, f]),
);
