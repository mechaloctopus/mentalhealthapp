// Side Module — "An Operating System for Psychological Health, Wisdom & Flourishing."
// Skill trees: many small growth dimensions. Practice (not consumption) levels them.
import { colors } from '../theme/theme';
import type { Ionicons } from '@expo/vector-icons';

export type TreeId =
  | 'mindfulness'
  | 'compassion'
  | 'purpose'
  | 'wisdom'
  | 'fitness'
  | 'nutrition'
  | 'relationships'
  | 'leadership'
  | 'service'
  | 'creativity'
  | 'flow';

export interface SkillTree {
  id: TreeId;
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const TREES: SkillTree[] = [
  { id: 'mindfulness', label: 'Mindfulness', color: colors.teal, icon: 'leaf' },
  { id: 'compassion', label: 'Compassion', color: colors.coral, icon: 'heart' },
  { id: 'purpose', label: 'Purpose', color: colors.amber, icon: 'compass' },
  { id: 'wisdom', label: 'Wisdom', color: colors.lavender, icon: 'sparkles' },
  { id: 'fitness', label: 'Fitness', color: colors.moss, icon: 'barbell' },
  { id: 'nutrition', label: 'Nutrition', color: '#b6d97a', icon: 'nutrition' },
  { id: 'relationships', label: 'Relationships', color: '#ff9d5c', icon: 'people' },
  { id: 'leadership', label: 'Leadership', color: colors.blue, icon: 'flag' },
  { id: 'service', label: 'Service', color: '#5ec8b0', icon: 'hand-left' },
  { id: 'creativity', label: 'Creativity', color: '#c77dff', icon: 'color-palette' },
  { id: 'flow', label: 'Flow', color: '#7db9ff', icon: 'pulse' },
];

export const TREE_BY_ID: Record<TreeId, SkillTree> = Object.fromEntries(
  TREES.map((t) => [t.id, t])
) as Record<TreeId, SkillTree>;

// Each tree has up to 100 levels; small daily actions add up over time.
const XP_PER_LEVEL = 40;
export const MAX_LEVEL = 100;

export function treeLevel(xp: number): { level: number; into: number; span: number } {
  const level = Math.min(MAX_LEVEL, Math.floor(xp / XP_PER_LEVEL));
  const into = xp - level * XP_PER_LEVEL;
  return { level, into, span: XP_PER_LEVEL };
}
