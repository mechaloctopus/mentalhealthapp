// Firebase is loaded lazily and ONLY when real config is present. In demo mode
// (no keys) no Firebase code executes at all — this keeps startup fast and avoids
// the Firestore/Hermes module-load issues that can freeze a release build.
import type { Auth } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigured } from './authConfig';

let _auth: Auth | null = null;
let _inited = false;

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured) return null;
  if (_inited) return _auth;
  _inited = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { initializeApp, getApps, getApp } = require('firebase/app');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { initializeAuth, getAuth, getReactNativePersistence } = require('firebase/auth');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    try {
      _auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    } catch {
      _auth = getAuth(app);
    }
  } catch {
    _auth = null;
  }
  return _auth;
}

// Lazily exposes firebase/auth helpers only when needed.
export function getAuthHelpers() {
  if (!isFirebaseConfigured) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('firebase/auth') as typeof import('firebase/auth');
  } catch {
    return null;
  }
}
