// Zustand store for MoodSignal v2.
// Single store, slice-structured. All slices are in this file for simplicity.

import { create } from 'zustand';
import type { AppUser } from '../lib/auth';
import type { CheckIn, Baseline } from '../engine/voice';

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
  setActiveSchool: (id: string | null) => void;
  addQuestCompletion: (q: QuestCompletion) => void;
  setQuestCompletions: (qs: QuestCompletion[]) => void;
}

// ── UI slice ───────────────────────────────────────────────────────────────

interface UiSlice {
  onboarded: boolean;
  reminderHour: number | null;
  setOnboarded: (v: boolean) => void;
  setReminderHour: (h: number | null) => void;
}

// ── Combined store ─────────────────────────────────────────────────────────

type AppStore = AuthSlice & CheckInSlice & JournalSlice & JourneySlice & UiSlice;

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
  addCheckIn: (c) => {
    const isToday = isSameDay(c.at, Date.now());
    set((s) => ({
      recentCheckIns: [c, ...s.recentCheckIns].slice(0, 90),
      todayCheckIn: isToday ? c : s.todayCheckIn,
    }));
  },
  setBaseline: (baseline) => set({ baseline }),
  setRecentCheckIns: (cs) => {
    const today = cs.find((c) => isSameDay(c.at, Date.now()));
    set({ recentCheckIns: cs, todayCheckIn: today ?? null });
  },

  // Journal
  recentEntries: [],
  addEntry: (e) => set((s) => ({ recentEntries: [e, ...s.recentEntries].slice(0, 60) })),
  setRecentEntries: (recentEntries) => set({ recentEntries }),

  // Journey
  activeSchoolId: null,
  questCompletions: [],
  setActiveSchool: (activeSchoolId) => set({ activeSchoolId }),
  addQuestCompletion: (q) => set((s) => ({ questCompletions: [q, ...s.questCompletions] })),
  setQuestCompletions: (questCompletions) => set({ questCompletions }),

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
