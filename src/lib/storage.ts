// Local-first persistence behind a tiny typed adapter.
// Swap this implementation for encrypted local storage or secure sync later without touching screens.
import AsyncStorage from '@react-native-async-storage/async-storage';

const NS = 'moodsignal:';

export interface StorageIssue {
  key: string;
  op: 'read' | 'write' | 'remove' | 'clear';
  at: number;
}

let lastIssue: StorageIssue | null = null;

function recordIssue(key: string, op: StorageIssue['op']) {
  lastIssue = { key, op, at: Date.now() };
}

export function getLastStorageIssue(): StorageIssue | null {
  return lastIssue;
}

export function clearLastStorageIssue(): void {
  lastIssue = null;
}

export async function getItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(NS + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    recordIssue(key, 'read');
    return fallback;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(NS + key, JSON.stringify(value));
  } catch {
    recordIssue(key, 'write');
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(NS + key);
  } catch {
    recordIssue(key, 'remove');
  }
}

export async function clearAll(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((key) => key.startsWith(NS));
    await AsyncStorage.multiRemove(ours);
  } catch {
    recordIssue('*', 'clear');
  }
}

export const KEYS = {
  user: 'user',
  onboarded: 'onboarded',
  baseline: 'baseline',
  checkins: 'checkins',
  prefs: 'prefs',
  savedMessages: 'savedMessages',
  sessions: 'sessions',
  journal: 'journal',
  screeners: 'screeners',
  researchConsent: 'researchConsent',
  cosmicBirth: 'cosmicBirth',
} as const;
