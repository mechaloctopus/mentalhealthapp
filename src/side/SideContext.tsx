import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getItem, setItem } from '../lib/storage';
import { dayKey } from '../lib/insights';
import { DAILY_POOL, PATHS, getQuest, getPath, type Quest } from './content';
import type { TreeId } from './trees';

const KEY = 'sideState';

interface Reflection { id: string; questId: string; text: string; at: number }

interface SideData {
  resonance: number;
  treeXp: Partial<Record<TreeId, number>>;
  karma: number;
  stewardship: number;
  flow: number;
  completions: Record<string, number[]>; // questId -> completion timestamps
  activePaths: string[];
  daily: { date: string; questIds: string[]; done: string[] };
  reflections: Reflection[];
}

const EMPTY: SideData = {
  resonance: 0,
  treeXp: {},
  karma: 0,
  stewardship: 0,
  flow: 0,
  completions: {},
  activePaths: [],
  daily: { date: '', questIds: [], done: [] },
  reflections: [],
};

interface SideCtx extends SideData {
  ready: boolean;
  isDoneToday: (id: string) => boolean;
  isCompleted: (id: string) => boolean;
  canComplete: (id: string) => boolean;
  completeQuest: (id: string, reflection?: string) => void;
  startPath: (id: string) => void;
  pathProgress: (id: string) => { done: number; total: number };
  nextQuestsForPath: (id: string) => Quest[];
}

const Ctx = createContext<SideCtx | null>(null);

// Deterministic pick of N daily-pool quests for a given date.
function dailyPoolFor(date: Date, n: number): string[] {
  const doy = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const ids: string[] = [];
  for (let i = 0; i < n; i++) ids.push(DAILY_POOL[(doy + i * 3) % DAILY_POOL.length].id);
  return Array.from(new Set(ids));
}

export function SideProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SideData>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getItem<SideData>(KEY, EMPTY);
      const merged = { ...EMPTY, ...saved, daily: { ...EMPTY.daily, ...saved?.daily } };
      setData(rollDaily(merged));
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (next: SideData) => {
    setData(next);
    setItem(KEY, next);
  };

  // Rebuild today's quest set if the day changed.
  function rollDaily(d: SideData): SideData {
    const today = dayKey(Date.now());
    if (d.daily.date === today && d.daily.questIds.length) return d;
    const pool = dailyPoolFor(new Date(), 3);
    // add up to 2 next quests from active paths
    const extra: string[] = [];
    for (const pid of d.activePaths) {
      const path = getPath(pid);
      if (!path) continue;
      for (const s of path.stages) {
        for (const q of s.quests) {
          const ts = d.completions[q.id];
          if (!ts || ts.length === 0) { extra.push(q.id); break; }
        }
        if (extra.length >= 2) break;
      }
      if (extra.length >= 2) break;
    }
    const questIds = Array.from(new Set([...pool, ...extra.slice(0, 2)]));
    return { ...d, daily: { date: today, questIds, done: [] } };
  }

  const isDoneToday = (id: string) => {
    const ts = data.completions[id] ?? [];
    return ts.some((t) => dayKey(t) === dayKey(Date.now()));
  };
  const isCompleted = (id: string) => (data.completions[id]?.length ?? 0) > 0;

  const canComplete = (id: string) => {
    const q = getQuest(id);
    if (!q) return false;
    return q.repeatable ? !isDoneToday(id) : !isCompleted(id);
  };

  const actions = useMemo(
    () => ({
      completeQuest(id: string, reflection?: string) {
        const q = getQuest(id);
        if (!q) return;
        setData((d) => {
          const repeatable = !!q.repeatable;
          const alreadyToday = (d.completions[id] ?? []).some((t) => dayKey(t) === dayKey(Date.now()));
          const everDone = (d.completions[id]?.length ?? 0) > 0;
          if (repeatable ? alreadyToday : everDone) return d; // no double-claim

          const treeXp = { ...d.treeXp };
          for (const t of q.trees) treeXp[t] = (treeXp[t] ?? 0) + q.resonance;
          const completions = { ...d.completions, [id]: [...(d.completions[id] ?? []), Date.now()] };
          const daily = d.daily.questIds.includes(id) && !d.daily.done.includes(id)
            ? { ...d.daily, done: [...d.daily.done, id] }
            : d.daily;
          const reflections = reflection?.trim()
            ? [{ id: Math.random().toString(36).slice(2), questId: id, text: reflection.trim(), at: Date.now() }, ...d.reflections].slice(0, 500)
            : d.reflections;

          const next: SideData = {
            ...d,
            resonance: d.resonance + q.resonance,
            karma: d.karma + (q.grants?.karma ?? 0),
            stewardship: d.stewardship + (q.grants?.stewardship ?? 0),
            flow: d.flow + (q.grants?.flow ?? 0),
            treeXp,
            completions,
            daily,
            reflections,
          };
          setItem(KEY, next);
          return next;
        });
      },
      startPath(id: string) {
        setData((d) => {
          if (d.activePaths.includes(id)) return d;
          const next = rollDaily({ ...d, activePaths: [...d.activePaths, id] });
          setItem(KEY, next);
          return next;
        });
      },
    }),
    []
  );

  const pathProgress = (id: string) => {
    const path = getPath(id);
    if (!path) return { done: 0, total: 0 };
    let total = 0;
    let done = 0;
    for (const s of path.stages) for (const q of s.quests) {
      total++;
      if ((data.completions[q.id]?.length ?? 0) > 0) done++;
    }
    return { done, total };
  };

  const nextQuestsForPath = (id: string): Quest[] => {
    const path = getPath(id);
    if (!path) return [];
    const out: Quest[] = [];
    for (const s of path.stages) for (const q of s.quests) {
      if ((data.completions[q.id]?.length ?? 0) === 0) out.push(q);
    }
    return out;
  };

  const value: SideCtx = {
    ...data,
    ready,
    isDoneToday,
    isCompleted,
    canComplete,
    pathProgress,
    nextQuestsForPath,
    ...actions,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSide() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSide must be used within SideProvider');
  return ctx;
}
