import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getItem, setItem } from '../lib/storage';
import { dayKey } from '../lib/insights';
import { DAILY_POOL, getQuest, getPath, type Quest } from './content';
import type { TreeId } from './trees';

const KEY = 'sideState';

interface Reflection { id: string; questId: string; text: string; at: number }

interface SideData {
  resonance: number;
  treeXp: Partial<Record<TreeId, number>>;
  karma: number;
  stewardship: number;
  flow: number;
  completions: Record<string, number[]>;
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
  resetSide: () => Promise<void>;
  pathProgress: (id: string) => { done: number; total: number };
  nextQuestsForPath: (id: string) => Quest[];
}

const Ctx = createContext<SideCtx | null>(null);

function dailyPoolFor(date: Date, n: number): string[] {
  const doy = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const ids: string[] = [];
  for (let i = 0; i < n; i++) ids.push(DAILY_POOL[(doy + i * 3) % DAILY_POOL.length].id);
  return Array.from(new Set(ids));
}

function rollDaily(d: SideData): SideData {
  const today = dayKey(Date.now());
  if (d.daily.date === today && d.daily.questIds.length) return d;

  const pool = dailyPoolFor(new Date(), 3);
  const extra: string[] = [];
  for (const pid of d.activePaths) {
    const path = getPath(pid);
    if (!path) continue;
    for (const stage of path.stages) {
      for (const quest of stage.quests) {
        const timestamps = d.completions[quest.id];
        if (!timestamps || timestamps.length === 0) {
          extra.push(quest.id);
          break;
        }
      }
      if (extra.length >= 2) break;
    }
    if (extra.length >= 2) break;
  }

  return {
    ...d,
    daily: { date: today, questIds: Array.from(new Set([...pool, ...extra.slice(0, 2)])), done: [] },
  };
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
  }, []);

  const isDoneToday = (id: string) => {
    const timestamps = data.completions[id] ?? [];
    return timestamps.some((t) => dayKey(t) === dayKey(Date.now()));
  };

  const isCompleted = (id: string) => (data.completions[id]?.length ?? 0) > 0;

  const canComplete = (id: string) => {
    const quest = getQuest(id);
    if (!quest) return false;
    return quest.repeatable ? !isDoneToday(id) : !isCompleted(id);
  };

  const actions = useMemo(
    () => ({
      completeQuest(id: string, reflection?: string) {
        const quest = getQuest(id);
        if (!quest) return;

        setData((current) => {
          const alreadyToday = (current.completions[id] ?? []).some((t) => dayKey(t) === dayKey(Date.now()));
          const everDone = (current.completions[id]?.length ?? 0) > 0;
          if (quest.repeatable ? alreadyToday : everDone) return current;

          const treeXp = { ...current.treeXp };
          for (const tree of quest.trees) treeXp[tree] = (treeXp[tree] ?? 0) + quest.resonance;

          const completions = {
            ...current.completions,
            [id]: [...(current.completions[id] ?? []), Date.now()],
          };
          const daily = current.daily.questIds.includes(id) && !current.daily.done.includes(id)
            ? { ...current.daily, done: [...current.daily.done, id] }
            : current.daily;
          const reflections = reflection?.trim()
            ? [{ id: Math.random().toString(36).slice(2), questId: id, text: reflection.trim(), at: Date.now() }, ...current.reflections].slice(0, 500)
            : current.reflections;

          const next: SideData = {
            ...current,
            resonance: current.resonance + quest.resonance,
            karma: current.karma + (quest.grants?.karma ?? 0),
            stewardship: current.stewardship + (quest.grants?.stewardship ?? 0),
            flow: current.flow + (quest.grants?.flow ?? 0),
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
        setData((current) => {
          if (current.activePaths.includes(id)) return current;
          const next = rollDaily({ ...current, activePaths: [...current.activePaths, id] });
          setItem(KEY, next);
          return next;
        });
      },
      async resetSide() {
        const next = rollDaily(EMPTY);
        setData(next);
        await setItem(KEY, next);
      },
    }),
    []
  );

  const pathProgress = (id: string) => {
    const path = getPath(id);
    if (!path) return { done: 0, total: 0 };
    let total = 0;
    let done = 0;
    for (const stage of path.stages) {
      for (const quest of stage.quests) {
        total++;
        if ((data.completions[quest.id]?.length ?? 0) > 0) done++;
      }
    }
    return { done, total };
  };

  const nextQuestsForPath = (id: string): Quest[] => {
    const path = getPath(id);
    if (!path) return [];
    const out: Quest[] = [];
    for (const stage of path.stages) {
      for (const quest of stage.quests) {
        if ((data.completions[quest.id]?.length ?? 0) === 0) out.push(quest);
      }
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
