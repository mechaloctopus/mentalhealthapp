export interface Milestone {
  id: string;
  title: string;
  desc: string;
  resonance: number;
}

export const MILESTONES: Milestone[] = [
  {
    id: 'first-signal',
    title: 'The First Signal',
    desc: 'You completed your first voice check-in. The river has begun.',
    resonance: 50,
  },
  {
    id: 'settled',
    title: 'Settled',
    desc: 'Your baseline is recorded — the river now knows its source.',
    resonance: 75,
  },
  {
    id: 'seven-flames',
    title: 'Seven Flames',
    desc: 'Seven days in a row, showing up for yourself.',
    resonance: 100,
  },
  {
    id: 'long-path',
    title: 'The Long Path',
    desc: 'Thirty days — the signal is becoming a river.',
    resonance: 500,
  },
  {
    id: 'inner-voice',
    title: 'Inner Voice',
    desc: 'Ten voice check-ins. The practice is becoming a language.',
    resonance: 120,
  },
  {
    id: 'pages',
    title: 'Pages',
    desc: 'Five journal entries written. Something honest is forming.',
    resonance: 80,
  },
  {
    id: 'temple-seeker',
    title: 'Temple Seeker',
    desc: 'Your first quest, completed. The path opens.',
    resonance: 60,
  },
  {
    id: 'devotion',
    title: 'Devotion',
    desc: 'Ten quests done. The practice is becoming devotion.',
    resonance: 200,
  },
];

export interface MilestoneStats {
  totalCheckIns: number;
  totalVoiceCheckIns: number;
  hasBaseline: boolean;
  streak: number;
  totalEntries: number;
  totalQuestCompletions: number;
}

export function checkNewMilestones(stats: MilestoneStats, earnedIds: string[]): Milestone[] {
  const earned = new Set(earnedIds);
  return MILESTONES.filter((m) => {
    if (earned.has(m.id)) return false;
    switch (m.id) {
      case 'first-signal': return stats.totalVoiceCheckIns >= 1;
      case 'settled': return stats.hasBaseline;
      case 'seven-flames': return stats.streak >= 7;
      case 'long-path': return stats.streak >= 30;
      case 'inner-voice': return stats.totalVoiceCheckIns >= 10;
      case 'pages': return stats.totalEntries >= 5;
      case 'temple-seeker': return stats.totalQuestCompletions >= 1;
      case 'devotion': return stats.totalQuestCompletions >= 10;
      default: return false;
    }
  });
}
