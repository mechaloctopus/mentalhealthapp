// Dummy auth layer. Mimics Google Sign-In + anonymous mode without a backend.
// Replace `signInWithGoogle` with expo-auth-session / Firebase Auth later.

export interface User {
  id: string;
  name: string;
  email: string | null;
  avatarColor: string;
  provider: 'google' | 'anonymous';
  createdAt: number;
}

const SAMPLE_NAMES = ['Alex Rivera', 'Sam Okafor', 'Jordan Lee', 'Maya Solis', 'Casey Nguyen'];
const AVATAR_COLORS = ['#66e0ca', '#f0bd67', '#ef786c', '#b6a7ff', '#7db9ff'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Simulates the Google OAuth round-trip with a short delay and dummy profile.
export async function signInWithGoogle(): Promise<User> {
  await new Promise((r) => setTimeout(r, 900));
  const name = pick(SAMPLE_NAMES);
  const email = name.toLowerCase().replace(/[^a-z]/g, '.') + '@gmail.com';
  return {
    id: uid(),
    name,
    email,
    avatarColor: pick(AVATAR_COLORS),
    provider: 'google',
    createdAt: Date.now(),
  };
}

export async function continueAnonymously(): Promise<User> {
  await new Promise((r) => setTimeout(r, 350));
  return {
    id: uid(),
    name: 'Friend',
    email: null,
    avatarColor: pick(AVATAR_COLORS),
    provider: 'anonymous',
    createdAt: Date.now(),
  };
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
