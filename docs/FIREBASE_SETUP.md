# Enabling real Firebase + Google Sign-In

The app ships in **demo mode** (simulated Google sign-in) so it runs with zero config.
Follow these steps to turn on real authentication. No code changes are required —
you only fill in `app.json` → `extra`.

## 1. Create a Firebase project
1. Go to <https://console.firebase.google.com> → **Add project**.
2. Inside the project, open **Build → Authentication → Get started** and enable the
   **Google** sign-in provider.

## 2. Get the web config
1. Project settings (gear icon) → **Your apps** → add a **Web app** (`</>`).
2. Copy the `firebaseConfig` values into `app.json`:

```jsonc
"extra": {
  "firebase": {
    "apiKey": "AIza…",
    "authDomain": "your-project.firebaseapp.com",
    "projectId": "your-project",
    "storageBucket": "your-project.appspot.com",
    "messagingSenderId": "1234567890",
    "appId": "1:1234567890:web:abc123"
  },
  ...
}
```

## 3. Get the Google OAuth client IDs
In **Google Cloud Console → APIs & Services → Credentials** (same project):

| Platform | What to create | Where it goes |
|----------|----------------|---------------|
| **Web**     | OAuth client ID → *Web application*. Used by Expo Go. | `extra.google.webClientId` |
| **Android** | OAuth client ID → *Android*. Package: `io.moodsignal.app`. SHA-1: see below. | `extra.google.androidClientId` |
| **iOS**     | OAuth client ID → *iOS*. Bundle: `io.moodsignal.app`. | `extra.google.iosClientId` |

```jsonc
"google": {
  "webClientId": "xxxx.apps.googleusercontent.com",
  "androidClientId": "yyyy.apps.googleusercontent.com",
  "iosClientId": "zzzz.apps.googleusercontent.com"
}
```

### Getting the Android SHA-1
- **Debug / sideloaded APK** (the one built in this repo):
  ```bash
  keytool -list -v -keystore android/app/debug.keystore \
    -alias androiddebugkey -storepass android -keypass android
  ```
- **Production**: use the SHA-1 from your EAS or Play App Signing keystore.

## 4. Run / rebuild
- **Expo Go:** `npx expo start` — the web client ID is enough to test Google sign-in.
- **Standalone APK:** `npx expo prebuild -p android` then rebuild. The Android client ID
  + matching SHA-1 must be registered for sign-in to succeed.

## How it's wired
- `src/lib/authConfig.ts` — reads `extra`, exposes `isFirebaseConfigured` / `isGoogleConfigured`.
- `src/lib/firebase.ts` — initializes Firebase only when configured (AsyncStorage persistence).
- `src/lib/googleAuth.ts` — `useGoogleSignIn()` runs the Google flow and exchanges the
  token for a Firebase credential.
- `app/sign-in.tsx` — uses the real flow when configured, demo otherwise.

> Tip: keep secrets out of git by injecting values via EAS environment variables /
> `app.config.ts` instead of committing them to `app.json`.
