import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getItem, setItem } from '../lib/storage';
import { dayKey } from '../lib/insights';
import { DAILY_POOL, getQuest, getPath, type Quest } from './content';
import type { TreeId } from './trees';

const KEY = 'sideState';

export type CorePracticeId = 'breath' | 'stillness' | 'meta' | 'sound';

export const CORE_PRACTICE_REWARDS: Record<CorePracticeId, { completionId: string; resonance: number; trees: TreeId[]; label: string }> = {
  breath: { completionId: 'd-breath', resonance: 15, trees: ['mindfulness'], label: 'Mindfulness' },
  stillness: { completionId: 'd-sit', resonance: 15, trees: ['mindfulness', 'wisdom'], label: 'Mindfulness + Wisdom' },
  meta: { completionId: 'core-meta', resonance: 18, trees: ['compassion', 'relationships'], label: 'Compassion + Relationships' },
  sound: { completionId: 'core-sound', resonance: 12, trees: ['mindfulness', 'flow'], label: 'Mindfulness + Flow' },
};

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
  canAwardPractice: (kind: CorePracticeId) => boolean;
  completePractice: (kind: CorePracticeId) => void;
  startPath: (id: string) => void;
  resetSide: () => Promise<void>;
  pathProgress: (id: string) => { done: number; total: number };
  nextQuestsForPath: (id: string) => Quest[];
}

const Ctx = createContext<SideCtx | null>(null);

function dailyPoolFor(date: Date, count: number): string[] {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const ids: string[] = [];
  for (let index = 0; index < count; index++) ids.push(DAILY_POOL[(dayOfYear + index * 3) % DAILY_POOL.length].id);
  return Array.from(new Set(ids));
}

function rollDaily(data: SideData): SideData {
  const today = dayKey(Date.now());
  if (data.daily.date === today && data.daily.questIds.length) return data;

  const pool = dailyPoolFor(new Date(), 3);
  const extra: string[] = [];
  for (const pathId of data.activePaths) {
    const path = getPath(pathId);
    if (!path) continue;
    for (const stage of path.stages) {
      for (const quest of stage.quests) {
        if (!(data.completions[quest.id]?.length ?? 0)) {
          extra.push(quest.id);
          break;
        }
      }
      if (extra.length >= 2) break;
    }
    if (extra.length >= 2) break;
  }

  return {
    ...data,
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

  const isDoneToday = (id: string) => (data.completions[id] ?? []).some((timestamp) => dayKey(timestamp) === dayKey(Date.now()));
  const isCompleted = (id: string) => (data.completions[id]?.length ?? 0) > 0;
  const canComplete = (id: string) => {
    const quest = getQuest(id);
    if (!quest) return false;
    return quest.repeatable ? !isDoneToday(id) : !isCompleted(id);
  };
  const canAwardPractice = (kind: CorePracticeId) => !isDoneToday(CORE_PRACTICE_REWARDS[kind].completionId);

  const actions = useMemo(() => ({
    completeQuest(id: string, reflection?: string) {
      const quest = getQuest(id);
      if (!quest) return;

      setData((current) => {
        const alreadyToday = (current.completions[id] ?? []).some((timestamp) => dayKey(timestamp) === dayKey(Date.now()));
        const everDone = (current.completions[id]?.length ?? 0) > 0;
        if (quest.repeatable ? alreadyToday : everDone) return current;

        const treeXp = { ...current.treeXp };
        for (const tree of quest.trees) treeXp[tree] = (treeXp[tree] ?? 0) + quest.resonance;
        const completions = { ...current.completions, [id]: [...(current.completions[id] ?? []), Date.now()] };
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
    completePractice(kind: CorePracticeId) {
      const reward = CORE_PRACTICE_REWARDS[kind];
      setData((current) => {
        const alreadyToday = (current.completions[reward.completionId] ?? []).some((timestamp) => dayKey(timestamp) === dayKey(Date.now()));
        if (alreadyToday) return current;

        const treeXp = { ...current.treeXp };
        for (const tree of reward.trees) treeXp[tree] = (treeXp[tree] ?? 0) + reward.resonance;
        const completions = {
          ...current.completions,
          [reward.completionId]: [...(current.completions[reward.completionId] ?? []), Date.now()],
        };
        const daily = current.daily.questIds.includes(reward.completionId) && !current.daily.done.includes(reward.completionId)
          ? { ...current.daily, done: [...current.daily.done, reward.completionId] }
          : current.daily;
        const next: SideData = {
          ...current,
          resonance: current.resonance + reward.resonance,
          flow: current.flow + (kind === 'sound' ? 1 : 0),
          treeXp,
          completions,
          daily,
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
  }), []);

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
    return path.stages.flatMap((stage) => stage.quests).filter((quest) => !(data.completions[quest.id]?.length ?? 0));
  };

  const value: SideCtx = {
    ...data,
    ready,
    isDoneToday,
    isCompleted,
    canComplete,
    canAwardPractice,
    pathProgress,
    nextQuestsForPath,
    ...actions,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSide() {
  const context = useContext(Ctx);
  if (!context) throw new Error('useSide must be used within SideProvider');
  return context;
}
