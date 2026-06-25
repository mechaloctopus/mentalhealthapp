# MoodSignal

**Research-informed emotional calibration.** An ultra-premium mental-health companion built with React Native + Expo, runnable on **iOS and Android via Expo Go**.

A short daily voice check-in estimates how you're arriving, then suggests *one* gentle practice — never an overwhelming list. Alongside it, **365 days** of thoughtful affirmations, quotes, and devotionals arrive as daily notifications, each opening into a beautiful full-screen viewport to pause and breathe.

> MoodSignal is a wellness and self-reflection aid. It is **not** a medical device and does not diagnose or treat any condition. Voice analysis happens **on-device**.

---

## ✨ Features

- **Onboarding + Google sign-in** — polished intro slides, dummy Google Sign-In and anonymous mode (swap in real auth later).
- **Voice baseline** — a guided breath settle followed by a short voice capture that becomes your private reference point.
- **Voice check-in** — record 30–60s; on-device acoustic-style features (loudness, variability, pause ratio) map to **energy, calmness, stability, stress**, plus a baseline shift and one matched practice.
- **365 daily messages** — a curated, deterministic year of affirmations · devotionals · quotes · breath cues · grounding · gratitude · stillness · resilience · thoughts. Browsable, filterable, and savable.
- **Daily notifications** — a rolling 60-day window of distinct daily affirmations (respecting the iOS pending-notification cap), topped up on launch. Tapping one **deep-links into the message viewport**.
- **Practices** — guided **Breath** (animated orb, multiple patterns), **Perfect Stillness** (body scan), **Loving-kindness** (meta meditation), and **Sound** (runtime-synthesized binaural / AM / pure relaxation tones — they actually play).
- **Premium design system** — deep-navy animated canvas, glass-morphism, Inter + Newsreader, Reanimated motion, haptics, custom blurred tab bar.
- **Local-first** — everything persists on-device via AsyncStorage behind a small adapter that can be swapped for Firebase/Supabase.

## 🧱 Tech stack

React Native 0.76 · Expo SDK 52 · TypeScript · Expo Router · Reanimated 3 · react-native-svg · expo-av (voice) · expo-notifications · expo-blur / linear-gradient · AsyncStorage.

## 🚀 Run it (Expo Go)

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android). Microphone and notification permissions are requested in-flow. To build standalone apps later: `eas build -p ios|android`.

> Notifications and microphone capture require a physical device (or a simulator with a mic). On iOS Expo Go, allow notifications when prompted; use **Profile → Send a preview** to see the notification → viewport experience instantly.

## 🗂️ Structure

```
app/                       # Expo Router screens
  _layout.tsx              # providers, fonts, notification deep-linking
  index.tsx                # boot gate (onboarding → sign-in → baseline → tabs)
  onboarding.tsx  sign-in.tsx  baseline.tsx
  checkin.tsx              # voice check-in flow
  breath / stillness / meta / sound .tsx
  message/[id].tsx         # the beautiful notification viewport
  (tabs)/                  # Today · Voice · Practices · 365 · You
src/
  components/              # design system + visualizations (BreathOrb, Waveform, SignalBar…)
  data/messages.ts         # the 365-day content engine
  lib/                     # storage, auth (dummy), voice analysis, notifications, tone synth, haptics
  context/AppContext.tsx   # global state + persistence
  theme/theme.ts           # tokens
scripts/gen-assets.js      # generates the branded PNG icon/splash
```

## 🔌 Swapping in a real backend

`src/lib/storage.ts` and `src/lib/auth.ts` are intentionally thin. Replace the AsyncStorage adapter with Firestore/Supabase and `signInWithGoogle` with `expo-auth-session` or Firebase Auth — no screen changes required.

## ⚠️ Disclaimer

If you are in crisis, contact local emergency services or a crisis line. MoodSignal does not provide medical advice.
