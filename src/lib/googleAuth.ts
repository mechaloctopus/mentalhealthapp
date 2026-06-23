// Google Sign-In via expo-auth-session, exchanged for a Firebase credential.
// Works in Expo Go and standalone builds. Falls back to demo mode when unconfigured.
import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { getFirebaseAuth, getAuthHelpers } from './firebase';
import { googleClientIds, isFirebaseConfigured, isGoogleConfigured } from './authConfig';
import type { User } from './auth';

WebBrowser.maybeCompleteAuthSession();

const AVATAR_COLORS = ['#66e0ca', '#f0bd67', '#ef786c', '#b6a7ff', '#7db9ff'];
function colorFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function mapUser(fb: { uid: string; displayName: string | null; email: string | null }): User {
  return {
    id: fb.uid,
    name: fb.displayName ?? fb.email?.split('@')[0] ?? 'Friend',
    email: fb.email,
    avatarColor: colorFor(fb.uid),
    provider: 'google',
    createdAt: Date.now(),
  };
}

/**
 * Real Google → Firebase sign-in. `onUser` fires with the mapped app user on success.
 * `configured` is false when keys are absent; the caller should use demo sign-in then.
 */
export function useGoogleSignIn(onUser: (u: User) => void, onError?: (msg: string) => void) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: googleClientIds.webClientId || undefined,
    androidClientId: googleClientIds.androidClientId || undefined,
    iosClientId: googleClientIds.iosClientId || undefined,
  });
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      (async () => {
        try {
          const idToken = response.authentication?.idToken ?? (response.params as any)?.id_token;
          const fbAuth = getFirebaseAuth();
          const helpers = getAuthHelpers();
          if (isFirebaseConfigured && fbAuth && helpers && idToken) {
            const credential = helpers.GoogleAuthProvider.credential(idToken);
            const result = await helpers.signInWithCredential(fbAuth, credential);
            onUser(mapUser(result.user));
          } else if (idToken) {
            // Firebase not configured but Google succeeded — proceed with the Google identity.
            onUser(mapUser({ uid: idToken.slice(0, 24), displayName: null, email: null }));
          } else {
            onError?.('No identity token returned.');
          }
        } catch (e: any) {
          onError?.(e?.message ?? 'Google sign-in failed.');
        } finally {
          setPending(false);
        }
      })();
    } else if (response.type === 'error' || response.type === 'dismiss' || response.type === 'cancel') {
      setPending(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return {
    configured: isGoogleConfigured,
    ready: !!request,
    pending,
    prompt: async () => {
      setPending(true);
      await promptAsync();
    },
  };
}
