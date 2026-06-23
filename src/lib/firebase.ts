// Firebase initialization (JS SDK — Expo Go compatible). Only initializes when
// real config is present; otherwise the app runs in demo mode.
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  // @ts-expect-error — getReactNativePersistence is exported at runtime but missing from types in some firebase builds.
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig, isFirebaseConfigured } from './authConfig';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  try {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // Already initialized (e.g. fast refresh) — fall back to the existing instance.
    auth = getAuth(app);
  }
  db = getFirestore(app);
}

export { app as firebaseApp, auth as firebaseAuth, db as firestore };
