// The AI Mentor — for now a personalized, on-device nudge computed from the user's
// recent mood (core app) and Side Module activity. Built behind a simple interface
// so a real Claude-powered mentor (with memory) can replace it via a secure backend.
import { getEmotion } from '../lib/emotions';

export interface MentorInput {
  name: string;
  lastEmotion?: string; // emotion id
  daysSinceCheckin: number;
  coreStreak: number;
  resonance: number;
  doneToday: number;
  totalToday: number;
  karma: number;
  stewardship: number;
}

export interface MentorNudge {
  line: string;
  cta?: { label: string; route: string };
}

export function mentorNudge(i: MentorInput): MentorNudge {
  const name = i.name || 'friend';

  if (i.totalToday > 0 && i.doneToday >= i.totalToday) {
    return { line: `You've completed every quest today, ${name}. That's real practice — rest is part of it too.`, cta: { label: 'Reflect in your journal', route: '/journal-new' } };
  }
  if (i.lastEmotion) {
    const e = getEmotion(i.lastEmotion);
    if (e.valence < -0.3) {
      return { line: `You've been sitting with ${e.label.toLowerCase()} feelings. Let's keep today gentle — one small, kind action is enough.`, cta: { label: 'A soft quest', route: '/side' } };
    }
    if (e.valence > 0.4) {
      return { line: `You're carrying some lightness, ${name}. A good day to do a little extra for someone else.`, cta: { label: 'An act of service', route: '/side/path/purpose' } };
    }
  }
  if (i.daysSinceCheckin >= 2) {
    return { line: `It's been a few days since a check-in. A 60-second one will help me tailor today for you.`, cta: { label: 'Quick check-in', route: '/checkin' } };
  }
  if (i.doneToday === 0 && i.totalToday > 0) {
    return { line: `A fresh set of quests is waiting. Start with the smallest one — momentum beats motivation.`, cta: { label: "Today's quests", route: '/side' } };
  }
  if (i.coreStreak >= 3) {
    return { line: `${i.coreStreak} days in a row, ${name}. The signal is getting stronger. Keep it gentle and steady.` };
  }
  return { line: `Welcome back, ${name}. Small actions, repeated, become a different life. What feels possible today?` };
}
