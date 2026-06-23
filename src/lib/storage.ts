// Local-first persistence behind a tiny typed adapter.
// Swap this implementation for Firebase/Supabase later without touching screens.
import AsyncStorage from '@react-native-async-storage/async-storage';

const NS = 'moodsignal:';

export async function getItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(NS + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(NS + key, JSON.stringify(value));
  } catch {
    // best-effort; ignore write failures on device
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(NS + key);
  } catch {
    /* noop */
  }
}

export async function clearAll(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((k) => k.startsWith(NS));
    await AsyncStorage.multiRemove(ours);
  } catch {
    /* noop */
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
  notificationsScheduled: 'notificationsScheduled',
} as const;
