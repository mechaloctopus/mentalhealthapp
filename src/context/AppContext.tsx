import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getItem, setItem, removeItem, clearAll, KEYS } from '../lib/storage';
import type { User } from '../lib/auth';
import type { Baseline, CheckIn } from '../lib/voice';
import { DEFAULT_NOTIF_PREFS, scheduleDailyMessages, type NotifPrefs } from '../lib/notifications';
import { setHapticsEnabled } from '../lib/haptics';
import { getFirebaseAuth, getAuthHelpers } from '../lib/firebase';

interface Prefs {
  notif: NotifPrefs;
  hapticsOn: boolean;
}

interface SessionLog {
  id: string;
  kind: 'breath' | 'stillness' | 'meta' | 'sound';
  minutes: number;
  at: number;
}

interface AppState {
  ready: boolean;
  user: User | null;
  onboarded: boolean;
  baseline: Baseline | null;
  checkins: CheckIn[];
  sessions: SessionLog[];
  saved: number[]; // saved message ids
  prefs: Prefs;
}

interface AppActions {
  setUser: (u: User | null) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setBaseline: (b: Baseline) => Promise<void>;
  addCheckIn: (c: CheckIn) => Promise<void>;
  addSession: (s: Omit<SessionLog, 'id' | 'at'>) => Promise<void>;
  toggleSaved: (id: number) => Promise<void>;
  updateNotifPrefs: (p: Partial<NotifPrefs>) => Promise<void>;
  setHaptics: (on: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resetAll: () => Promise<void>;
}

const Ctx = createContext<(AppState & AppActions) | null>(null);

const DEFAULT_PREFS: Prefs = { notif: DEFAULT_NOTIF_PREFS, hapticsOn: true };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    ready: false,
    user: null,
    onboarded: false,
    baseline: null,
    checkins: [],
    sessions: [],
    saved: [],
    prefs: DEFAULT_PREFS,
  });

  useEffect(() => {
    let done = false;
    // Safety net: never let the app hang on the loading screen — flip ready after 4s
    // even if storage is unexpectedly slow.
    const safety = setTimeout(() => {
      if (!done) setState((s) => ({ ...s, ready: true }));
    }, 4000);

    (async () => {
      try {
        const [user, onboarded, baseline, checkins, sessions, saved, prefs] = await Promise.all([
          getItem<User | null>(KEYS.user, null),
          getItem<boolean>(KEYS.onboarded, false),
          getItem<Baseline | null>(KEYS.baseline, null),
          getItem<CheckIn[]>(KEYS.checkins, []),
          getItem<SessionLog[]>(KEYS.sessions, []),
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
          saved,
          prefs: { ...DEFAULT_PREFS, ...prefs, notif: { ...DEFAULT_NOTIF_PREFS, ...prefs?.notif } },
        });
      } catch {
        setState((s) => ({ ...s, ready: true }));
      } finally {
        done = true;
        clearTimeout(safety);
      }
    })();

    return () => clearTimeout(safety);
  }, []);

  // Keep the global haptics flag in sync with preferences.
  useEffect(() => {
    setHapticsEnabled(state.prefs.hapticsOn);
  }, [state.prefs.hapticsOn]);

  const actions: AppActions = useMemo(
    () => ({
      async setUser(u) {
        setState((s) => ({ ...s, user: u }));
        if (u) await setItem(KEYS.user, u);
        else await removeItem(KEYS.user);
      },
      async completeOnboarding() {
        setState((s) => ({ ...s, onboarded: true }));
        await setItem(KEYS.onboarded, true);
      },
      async setBaseline(b) {
        setState((s) => ({ ...s, baseline: b }));
        await setItem(KEYS.baseline, b);
      },
      async addCheckIn(c) {
        setState((s) => {
          const checkins = [c, ...s.checkins].slice(0, 200);
          setItem(KEYS.checkins, checkins);
          return { ...s, checkins };
        });
      },
      async addSession(s0) {
        const entry: SessionLog = { ...s0, id: Math.random().toString(36).slice(2), at: Date.now() };
        setState((s) => {
          const sessions = [entry, ...s.sessions].slice(0, 300);
          setItem(KEYS.sessions, sessions);
          return { ...s, sessions };
        });
      },
      async toggleSaved(id) {
        setState((s) => {
          const saved = s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [id, ...s.saved];
          setItem(KEYS.savedMessages, saved);
          return { ...s, saved };
        });
      },
      async updateNotifPrefs(p) {
        let nextPrefs!: Prefs;
        setState((s) => {
          nextPrefs = { ...s.prefs, notif: { ...s.prefs.notif, ...p } };
          setItem(KEYS.prefs, nextPrefs);
          return { ...s, prefs: nextPrefs };
        });
        // Reschedule notifications to reflect new prefs.
        try {
          await scheduleDailyMessages(nextPrefs.notif);
        } catch {
          /* permissions / platform issues ignored */
        }
      },
      async setHaptics(on) {
        setState((s) => {
          const prefs = { ...s.prefs, hapticsOn: on };
          setItem(KEYS.prefs, prefs);
          return { ...s, prefs };
        });
      },
      async signOut() {
        setState((s) => ({ ...s, user: null }));
        await removeItem(KEYS.user);
        // Best-effort Firebase sign-out when configured.
        try {
          const fbAuth = getFirebaseAuth();
          const helpers = getAuthHelpers();
          if (fbAuth && helpers) await helpers.signOut(fbAuth);
        } catch {
          /* not configured */
        }
      },
      async resetAll() {
        await clearAll();
        setState({
          ready: true,
          user: null,
          onboarded: false,
          baseline: null,
          checkins: [],
          sessions: [],
          saved: [],
          prefs: DEFAULT_PREFS,
        });
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
