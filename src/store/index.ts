// Zustand store for MoodSignal v2.
// Single store, slice-structured.

import { create } from 'zustand';
import type { AppUser } from '../lib/auth';
import type { CheckIn, Baseline } from '../engine/voice';
import type { Milestone } from '../lib/milestones';

// ── Auth slice ─────────────────────────────────────────────────────────────

interface AuthSlice {
  user: AppUser | null;
  isLoading: boolean;
  setUser: (user: AppUser | null) => void;
  setLoading: (v: boolean) => void;
}

// ── Check-in slice ─────────────────────────────────────────────────────────

interface CheckInSlice {
  recentCheckIns: CheckIn[];
  baseline: Baseline | null;
  todayCheckIn: CheckIn | null;
  streak: number;
  addCheckIn: (c: CheckIn) => void;
  setBaseline: (b: Baseline | null) => void;
  setRecentCheckIns: (cs: CheckIn[]) => void;
}

// ── Journal slice ──────────────────────────────────────────────────────────

export interface JournalEntry {
  id: string;
  at: number;
  prompt: string | null;
  body: string;
  emotion: string | null;
  type: 'free' | 'reflect' | 'gratitude';
}

interface JournalSlice {
  recentEntries: JournalEntry[];
  addEntry: (e: JournalEntry) => void;
  setRecentEntries: (es: JournalEntry[]) => void;
}

// ── Journey slice ──────────────────────────────────────────────────────────

export interface QuestCompletion {
  questId: string;
  completedAt: number;
  emotion?: string;
}

interface JourneySlice {
  activeSchoolId: string | null;
  questCompletions: QuestCompletion[];
  schoolProgress: Record<string, string[]>; // schoolId → seen lessonIds
  setActiveSchool: (id: string | null) => void;
  addQuestCompletion: (q: QuestCompletion) => void;
  setQuestCompletions: (qs: QuestCompletion[]) => void;
  setSchoolProgress: (p: Record<string, string[]>) => void;
  markLessonSeenLocal: (schoolId: string, lessonId: string) => void;
}

// ── Resonance slice ────────────────────────────────────────────────────────

interface ResonanceSlice {
  totalResonance: number;
  earnedMilestoneIds: string[];
  pendingMilestone: Milestone | null;
  addResonanceLocal: (amount: number) => void;
  setTotalResonance: (n: number) => void;
  setEarnedMilestones: (ids: string[]) => void;
  earnMilestoneLocal: (id: string) => void;
  setPendingMilestone: (m: Milestone | null) => void;
}

// ── UI slice ───────────────────────────────────────────────────────────────

interface UiSlice {
  onboarded: boolean;
  reminderHour: number | null;
  setOnboarded: (v: boolean) => void;
  setReminderHour: (h: number | null) => void;
}

// ── Combined store ─────────────────────────────────────────────────────────

type AppStore = AuthSlice & CheckInSlice & JournalSlice & JourneySlice & ResonanceSlice & UiSlice;

export const useStore = create<AppStore>()((set, get) => ({
  // Auth
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  // Check-in
  recentCheckIns: [],
  baseline: null,
  todayCheckIn: null,
  streak: 0,
  addCheckIn: (c) => {
    const isToday = isSameDay(c.at, Date.now());
    set((s) => {
      const updated = [c, ...s.recentCheckIns].slice(0, 90);
      return {
        recentCheckIns: updated,
        todayCheckIn: isToday ? c : s.todayCheckIn,
        streak: computeStreak(updated),
      };
    });
  },
  setBaseline: (baseline) => set({ baseline }),
  setRecentCheckIns: (cs) => {
    const today = cs.find((c) => isSameDay(c.at, Date.now()));
    set({ recentCheckIns: cs, todayCheckIn: today ?? null, streak: computeStreak(cs) });
  },

  // Journal
  recentEntries: [],
  addEntry: (e) => set((s) => ({ recentEntries: [e, ...s.recentEntries].slice(0, 60) })),
  setRecentEntries: (recentEntries) => set({ recentEntries }),

  // Journey
  activeSchoolId: null,
  questCompletions: [],
  schoolProgress: {},
  setActiveSchool: (activeSchoolId) => set({ activeSchoolId }),
  addQuestCompletion: (q) => set((s) => ({ questCompletions: [q, ...s.questCompletions] })),
  setQuestCompletions: (questCompletions) => set({ questCompletions }),
  setSchoolProgress: (schoolProgress) => set({ schoolProgress }),
  markLessonSeenLocal: (schoolId, lessonId) =>
    set((s) => {
      const current = s.schoolProgress[schoolId] ?? [];
      if (current.includes(lessonId)) return s;
      return { schoolProgress: { ...s.schoolProgress, [schoolId]: [...current, lessonId] } };
    }),

  // Resonance
  totalResonance: 0,
  earnedMilestoneIds: [],
  pendingMilestone: null,
  addResonanceLocal: (amount) => set((s) => ({ totalResonance: s.totalResonance + amount })),
  setTotalResonance: (totalResonance) => set({ totalResonance }),
  setEarnedMilestones: (earnedMilestoneIds) => set({ earnedMilestoneIds }),
  earnMilestoneLocal: (id) =>
    set((s) => ({ earnedMilestoneIds: s.earnedMilestoneIds.includes(id) ? s.earnedMilestoneIds : [...s.earnedMilestoneIds, id] })),
  setPendingMilestone: (pendingMilestone) => set({ pendingMilestone }),

  // UI
  onboarded: false,
  reminderHour: null,
  setOnboarded: (onboarded) => set({ onboarded }),
  setReminderHour: (reminderHour) => set({ reminderHour }),
}));

function isSameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear()
    && da.getMonth() === db.getMonth()
    && da.getDate() === db.getDate();
}

function computeStreak(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0;
  const days = new Set(checkIns.map((c) => {
    const d = new Date(c.at);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }));
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 366; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (days.has(key)) streak++;
    else break;
  }
  return streak;
}
