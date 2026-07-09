import { addResonance as dbAddResonance, getEarnedMilestoneIds, earnMilestoneById, getAllQuestCompletionsCount } from '../db';
import { useStore } from '../store';
import { checkNewMilestones } from './milestones';

export const AWARDS = {
  CHECKIN_VOICE: 15,
  CHECKIN_SELF: 8,
  CHECKIN_BASELINE: 30,
  JOURNAL_FREE: 10,
  JOURNAL_REFLECT: 12,
  JOURNAL_GRATITUDE: 15,
  QUEST_COMPLETE: 20,
  PRACTICE_BREATH: 8,
  PRACTICE_STILLNESS: 10,
  PRACTICE_SOUND: 8,
  PRACTICE_SLEEP: 8,
  PRACTICE_LOVING_KINDNESS: 12,
} as const;

export type ResonanceAction = keyof typeof AWARDS;

export async function awardResonance(action: ResonanceAction): Promise<void> {
  const amount = AWARDS[action];
  const state = useStore.getState();

  await dbAddResonance(amount);
  state.addResonanceLocal(amount);

  const [totalQuestCompletions, earnedIds] = await Promise.all([
    getAllQuestCompletionsCount(),
    getEarnedMilestoneIds(),
  ]);

  const voiceCheckIns = state.recentCheckIns.filter((c) => c.source === 'voice').length;
  const newMilestones = checkNewMilestones(
    {
      totalCheckIns: state.recentCheckIns.length,
      totalVoiceCheckIns: voiceCheckIns,
      hasBaseline: !!state.baseline,
      streak: state.streak,
      totalEntries: state.recentEntries.length,
      totalQuestCompletions,
    },
    earnedIds,
  );

  for (const m of newMilestones) {
    await earnMilestoneById(m.id);
    await dbAddResonance(m.resonance);
    const s = useStore.getState();
    s.addResonanceLocal(m.resonance);
    s.earnMilestoneLocal(m.id);
    s.setPendingMilestone(m);
    break; // Surface one at a time
  }
}
