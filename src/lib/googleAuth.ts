// Google Sign-In via expo-auth-session, exchanged for a Firebase credential.
// Account sign-in is only enabled when both Google client IDs and Firebase are configured.
import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { getFirebaseAuth, getAuthHelpers } from './firebase';
import { googleClientIds, isFirebaseConfigured, isGoogleConfigured } from './authConfig';
import type { User } from './auth';

WebBrowser.maybeCompleteAuthSession();

const AVATAR_COLORS = ['#66e0ca', '#f0bd67', '#ef786c', '#b6a7ff', '#7db9ff'];

function colorFor(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index++) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
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

export function useGoogleSignIn(onUser: (user: User) => void, onError?: (message: string) => void) {
  const fullyConfigured = isGoogleConfigured && isFirebaseConfigured;
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
          if (!fullyConfigured) {
            onError?.('Google account sign-in is not configured for this build.');
            return;
          }

          const idToken = response.authentication?.idToken ?? (response.params as { id_token?: string }).id_token;
          const fbAuth = getFirebaseAuth();
          const helpers = getAuthHelpers();
          if (!fbAuth || !helpers || !idToken) {
            onError?.('Google sign-in could not be completed.');
            return;
          }

          const credential = helpers.GoogleAuthProvider.credential(idToken);
          const result = await helpers.signInWithCredential(fbAuth, credential);
          onUser(mapUser(result.user));
        } catch (error: unknown) {
          onError?.(error instanceof Error ? error.message : 'Google sign-in failed.');
        } finally {
          setPending(false);
        }
      })();
    } else if (response.type === 'error' || response.type === 'dismiss' || response.type === 'cancel') {
      setPending(false);
    }
  }, [fullyConfigured, onError, onUser, response]);

  return {
    configured: fullyConfigured,
    ready: fullyConfigured && !!request,
    pending,
    prompt: async () => {
      if (!fullyConfigured) {
        onError?.('Google account sign-in is not configured for this build.');
        return;
      }
      setPending(true);
      await promptAsync();
    },
  };
}
