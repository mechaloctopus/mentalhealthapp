// Auth provider interface — dummy implementation, swap-ready for real auth.
// Swap this file's internals to use any auth provider without touching screens.

import * as SecureStore from 'expo-secure-store';

export interface AppUser {
  id: string;
  displayName: string;
  email: string;
}

const USER_KEY = 'moodsignal_user_v2';

function makeDummyUser(): AppUser {
  return {
    id: 'local-' + Math.random().toString(36).slice(2),
    displayName: 'You',
    email: 'local@moodsignal.app',
  };
}

export async function getStoredUser(): Promise<AppUser | null> {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppUser;
  } catch {
    return null;
  }
}

export async function signIn(_email?: string, _password?: string): Promise<AppUser> {
  // Dummy: always succeeds and returns a local user
  const existing = await getStoredUser();
  if (existing) return existing;
  const user = makeDummyUser();
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  return user;
}

export async function signOut(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function isOnboarded(): Promise<boolean> {
  const val = await SecureStore.getItemAsync('moodsignal_onboarded_v2');
  return val === 'true';
}

export async function setOnboarded(): Promise<void> {
  await SecureStore.setItemAsync('moodsignal_onboarded_v2', 'true');
}
