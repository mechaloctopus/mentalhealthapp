import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getItem, setItem, removeItem, clearAll, KEYS } from '../lib/storage';
import { ensureStorageSchema } from '../lib/storageVersion';
import type { User } from '../lib/auth';
import type { Baseline, CheckIn } from '../lib/voice';
import type { ScreenerResult } from '../lib/screeners';
import { cancelAll, DEFAULT_NOTIF_PREFS, scheduleDailyMessages, type NotifPrefs } from '../lib/notifications';
import { setHapticsEnabled } from '../lib/haptics';
import { getFirebaseAuth, getAuthHelpers } from '../lib/firebase';

interface Prefs {
  notif: NotifPrefs;
  hapticsOn: boolean;
  focus: string[]; // goals chosen in onboarding (personalizes the home screen & suggestions)
}

interface SessionLog {
  id: string;
  kind: 'breath' | 'stillness' | 'meta' | 'sound';
  minutes: number;
  at: number;
}

export interface JournalEntry {
  id: string;
  at: number;
  text: string;
  prompt?: string;
  emotion?: string;
  source?: 'journal' | 'coach';
}

interface AppState {
  ready: boolean;
  user: User | null;
  onboarded: boolean;
  baseline: Baseline | null;
  checkins: CheckIn[];
  sessions: SessionLog[];
  journal: JournalEntry[];
  screeners: ScreenerResult[];
  researchConsent: boolean;
  saved: number[];
  prefs: Prefs;
}

interface AppActions {
  setUser: (u: User | null) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setBaseline: (b: Baseline) => Promise<void>;
  addCheckIn: (c: CheckIn) => Promise<void>;
  addSession: (s: Omit<SessionLog, 'id' | 'at'>) => Promise<void>;
  addJournal: (e: Omit<JournalEntry, 'id' | 'at'>) => Promise<void>;
  deleteJournal: (id: string) => Promise<void>;
  addScreener: (r: ScreenerResult) => Promise<void>;
  setResearchConsent: (v: boolean) => Promise<void>;
  toggleSaved: (id: number) => Promise<void>;
  updateNotifPrefs: (p: Partial<NotifPrefs>) => Promise<void>;
  setHaptics: (on: boolean) => Promise<void>;
  setFocus: (focus: string[]) => Promise<void>;
  signOut: () => Promise<void>;
  resetAll: () => Promise<void>;
}

const Ctx = createContext<(AppState & AppActions) | null>(null);
const DEFAULT_PREFS: Prefs = { notif: DEFAULT_NOTIF_PREFS, hapticsOn: true, focus: [] };

const EMPTY_STATE: AppState = {
  ready: false,
  user: null,
  onboarded: false,
  baseline: null,
  checkins: [],
  sessions: [],
  journal: [],
  screeners: [],
  researchConsent: false,
  saved: [],
  prefs: DEFAULT_PREFS,
};

function withPrefsDefaults(prefs: Prefs | null | undefined): Prefs {
  return { ...DEFAULT_PREFS, ...prefs, notif: { ...DEFAULT_NOTIF_PREFS, ...prefs?.notif } };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const stateRef = useRef<AppState>(EMPTY_STATE);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let done = false;
    const safety = setTimeout(() => {
      if (!done) setState((current) => ({ ...current, ready: true }));
    }, 4000);

    (async () => {
      try {
        await ensureStorageSchema();
        const [user, onboarded, baseline, checkins, sessions, journal, screeners, researchConsent, saved, prefs] = await Promise.all([
          getItem<User | null>(KEYS.user, null),
          getItem<boolean>(KEYS.onboarded, false),
          getItem<Baseline | null>(KEYS.baseline, null),
          getItem<CheckIn[]>(KEYS.checkins, []),
          getItem<SessionLog[]>(KEYS.sessions, []),
          getItem<JournalEntry[]>(KEYS.journal, []),
          getItem<ScreenerResult[]>(KEYS.screeners, []),
          getItem<boolean>(KEYS.researchConsent, false),
          getItem<number[]>(KEYS.savedMessages, []),
          getItem<Prefs>(KEYS.prefs, DEFAULT_PREFS),
        ]);
        setState({
          ready: true,
          user,
          onboarded,
          baseline,
          checkins,
          sessions,
          journal,
          screeners,
          researchConsent,
          saved,
          prefs: withPrefsDefaults(prefs),
        });
      } catch {
        setState((current) => ({ ...current, ready: true }));
      } finally {
        done = true;
        clearTimeout(safety);
      }
    })();

    return () => clearTimeout(safety);
  }, []);

  useEffect(() => {
    setHapticsEnabled(state.prefs.hapticsOn);
  }, [state.prefs.hapticsOn]);

  const actions: AppActions = useMemo(
    () => ({
      async setUser(user) {
        setState((current) => ({ ...current, user }));
        if (user) await setItem(KEYS.user, user);
        else await removeItem(KEYS.user);
      },
      async completeOnboarding() {
        setState((current) => ({ ...current, onboarded: true }));
        await setItem(KEYS.onboarded, true);
      },
      async setBaseline(baseline) {
        setState((current) => ({ ...current, baseline }));
        await setItem(KEYS.baseline, baseline);
      },
      async addCheckIn(checkin) {
        const checkins = [checkin, ...stateRef.current.checkins].slice(0, 200);
        setState((current) => ({ ...current, checkins }));
        await setItem(KEYS.checkins, checkins);
      },
      async addSession(session) {
        const entry: SessionLog = { ...session, id: Math.random().toString(36).slice(2), at: Date.now() };
        const sessions = [entry, ...stateRef.current.sessions].slice(0, 300);
        setState((current) => ({ ...current, sessions }));
        await setItem(KEYS.sessions, sessions);
      },
      async addJournal(journalEntry) {
        const entry: JournalEntry = { ...journalEntry, id: Math.random().toString(36).slice(2), at: Date.now() };
        const journal = [entry, ...stateRef.current.journal].slice(0, 500);
        setState((current) => ({ ...current, journal }));
        await setItem(KEYS.journal, journal);
      },
      async deleteJournal(id) {
        const journal = stateRef.current.journal.filter((entry) => entry.id !== id);
        setState((current) => ({ ...current, journal }));
        await setItem(KEYS.journal, journal);
      },
      async addScreener(result) {
        const screeners = [result, ...stateRef.current.screeners].slice(0, 200);
        setState((current) => ({ ...current, screeners }));
        await setItem(KEYS.screeners, screeners);
      },
      async setResearchConsent(researchConsent) {
        setState((current) => ({ ...current, researchConsent }));
        await setItem(KEYS.researchConsent, researchConsent);
      },
      async toggleSaved(id) {
        const previous = stateRef.current.saved;
        const saved = previous.includes(id) ? previous.filter((value) => value !== id) : [id, ...previous];
        setState((current) => ({ ...current, saved }));
        await setItem(KEYS.savedMessages, saved);
      },
      async updateNotifPrefs(partial) {
        const prefs = withPrefsDefaults({ ...stateRef.current.prefs, notif: { ...stateRef.current.prefs.notif, ...partial } });
        setState((current) => ({ ...current, prefs }));
        await setItem(KEYS.prefs, prefs);
        try {
          await scheduleDailyMessages(prefs.notif);
        } catch {
          /* permissions / platform issues ignored */
        }
      },
      async setHaptics(on) {
        const prefs = withPrefsDefaults({ ...stateRef.current.prefs, hapticsOn: on });
        setState((current) => ({ ...current, prefs }));
        await setItem(KEYS.prefs, prefs);
      },
      async setFocus(focus) {
        const prefs = withPrefsDefaults({ ...stateRef.current.prefs, focus });
        setState((current) => ({ ...current, prefs }));
        await setItem(KEYS.prefs, prefs);
      },
      async signOut() {
        setState((current) => ({ ...current, user: null }));
        await removeItem(KEYS.user);
        try {
          const fbAuth = getFirebaseAuth();
          const helpers = getAuthHelpers();
          if (fbAuth && helpers) await helpers.signOut(fbAuth);
        } catch {
          /* not configured */
        }
      },
      async resetAll() {
        await cancelAll();
        await clearAll();
        await ensureStorageSchema();
        setState({ ...EMPTY_STATE, ready: true });
      },
    }),
    []
  );

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
