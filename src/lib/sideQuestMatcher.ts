import { DAILY_POOL, PATHS, getQuest, type Quest } from '../side/content';

export interface SideQuestMatchInput {
  emotionId: string;
  stress?: 'Low' | 'Mild' | 'Elevated';
  energy?: number;
  calmness?: number;
  stability?: number;
  factors?: string[];
  activePaths?: string[];
  dailyQuestIds?: string[];
  doneToday?: string[];
  completedQuestIds?: string[];
}

export interface SideQuestMatch {
  quest: Quest;
  reason: string;
  score: number;
}

function allPathQuests(): Quest[] {
  return PATHS.flatMap((path) => path.stages.flatMap((stage) => stage.quests));
}

function uniqueQuests(quests: Quest[]): Quest[] {
  const seen = new Set<string>();
  return quests.filter((q) => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
}

function emotionScore(q: Quest, input: SideQuestMatchInput): number {
  const emotion = input.emotionId;
  let score = 0;

  if ((input.stress === 'Elevated' || (input.calmness ?? 100) < 40) && (q.kind === 'breath' || q.kind === 'meditate')) score += 24;
  if (((input.energy ?? 100) < 40 || emotion === 'drained') && (q.kind === 'meditate' || q.kind === 'action')) score += 12;
  if ((emotion === 'lonely' || emotion === 'sad') && (q.kind === 'service' || q.trees.includes('compassion') || q.trees.includes('relationships'))) score += 24;
  if ((emotion === 'frustrated' || emotion === 'overwhelmed') && (q.trees.includes('wisdom') || q.kind === 'reflect')) score += 18;
  if ((emotion === 'anxious' || emotion === 'overwhelmed') && (q.trees.includes('mindfulness') || q.kind === 'breath')) score += 22;
  if ((emotion === 'joy' || emotion === 'grateful' || emotion === 'content') && (q.kind === 'gratitude' || q.kind === 'service')) score += 18;
  if ((emotion === 'proud' || emotion === 'excited') && (q.trees.includes('purpose') || q.trees.includes('leadership') || q.trees.includes('flow'))) score += 14;

  if (q.trees.includes('purpose') && (emotion === 'drained' || emotion === 'sad' || emotion === 'lonely')) score += 10;
  if (q.trees.includes('flow') && (emotion === 'anxious' || emotion === 'excited' || emotion === 'frustrated')) score += 10;

  return score;
}

function reasonFor(q: Quest, input: SideQuestMatchInput): string {
  if (input.stress === 'Elevated' && (q.kind === 'breath' || q.kind === 'meditate')) return 'This quest gives your nervous system a concrete settling action.';
  if ((input.energy ?? 100) < 40) return 'This quest is small enough for low energy but still moves you forward.';
  if (input.emotionId === 'lonely' || input.emotionId === 'sad') return 'This quest uses connection, compassion, or service to widen the circle.';
  if (input.emotionId === 'frustrated' || input.emotionId === 'overwhelmed') return 'This quest turns the feeling into one clear, grounded action.';
  if (q.trees.includes('purpose')) return 'This quest practices purpose through stewardship.';
  if (q.trees.includes('flow')) return 'This quest trains attention through action instead of overthinking.';
  return 'This quest matches your current signal with one meaningful practice.';
}

export function matchSideQuest(input: SideQuestMatchInput): SideQuestMatch | null {
  const daily = (input.dailyQuestIds ?? []).map(getQuest).filter(Boolean) as Quest[];
  const activePathQuests = PATHS
    .filter((p) => input.activePaths?.includes(p.id))
    .flatMap((path) => path.stages.flatMap((stage) => stage.quests));

  const candidates = uniqueQuests([...daily, ...activePathQuests, ...DAILY_POOL, ...allPathQuests()]);
  const doneToday = new Set(input.doneToday ?? []);
  const completed = new Set(input.completedQuestIds ?? []);

  const scored = candidates
    .filter((q) => q.repeatable || !completed.has(q.id))
    .filter((q) => !doneToday.has(q.id))
    .map((quest) => {
      let score = emotionScore(quest, input);
      if (input.dailyQuestIds?.includes(quest.id)) score += 40;
      if (input.activePaths?.some((pid) => PATHS.find((p) => p.id === pid)?.stages.some((s) => s.quests.some((q) => q.id === quest.id)))) score += 18;
      if (quest.repeatable) score += 4;
      score += Math.min(12, Math.round(quest.resonance / 3));
      return { quest, reason: reasonFor(quest, input), score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0] ?? null;
}
