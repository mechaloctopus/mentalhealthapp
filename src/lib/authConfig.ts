// Auth configuration, read from app.json `extra`. Leave values empty to run the
// app in demo mode (dummy Google sign-in). Fill them in (or via EAS secrets) to
// enable real Firebase + Google Sign-In — no code changes required.
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  firebase?: Record<string, string>;
  google?: { webClientId?: string; androidClientId?: string; iosClientId?: string };
};

export const firebaseConfig = {
  apiKey: extra.firebase?.apiKey ?? '',
  authDomain: extra.firebase?.authDomain ?? '',
  projectId: extra.firebase?.projectId ?? '',
  storageBucket: extra.firebase?.storageBucket ?? '',
  messagingSenderId: extra.firebase?.messagingSenderId ?? '',
  appId: extra.firebase?.appId ?? '',
};

export const googleClientIds = {
  webClientId: extra.google?.webClientId ?? '',
  androidClientId: extra.google?.androidClientId ?? '',
  iosClientId: extra.google?.iosClientId ?? '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

export const isGoogleConfigured = Boolean(
  googleClientIds.webClientId || googleClientIds.androidClientId || googleClientIds.iosClientId
);
