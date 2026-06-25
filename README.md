# MoodSignal

**MoodSignal is a research-informed emotional calibration and human-flourishing app built with React Native, Expo, and TypeScript.**

The app helps a user move through a simple loop:

> **Signal → Awareness → Wisdom → Practice → Purpose → Growth**

A daily voice or self-report check-in helps the user understand their current state, then MoodSignal recommends one grounded next step instead of overwhelming them with a long menu of options.

MoodSignal is designed as a wellness and self-reflection companion. It is **not** a medical device, does **not** diagnose or treat any condition, and should not replace care from a qualified professional. Voice analysis is currently local and heuristic, using acoustic-style signals such as loudness, variability, pauses, and cadence proxies.

---

## Current Product Shape

MoodSignal already includes a meaningful prototype foundation:

- **Onboarding and boot gate** — routes users through onboarding, sign-in, baseline capture, and the main tab experience.
- **Voice baseline** — lets the user establish a private emotional reference point.
- **Voice check-in** — records a short spoken reflection and maps on-device metering features to energy, calmness, stability, stress, and a confidence-weighted emotion suggestion.
- **Self-report check-in** — lets the user correct or bypass voice interpretation through an emotion wheel.
- **One-step recommendations** — connects emotional state to one gentle practice.
- **Practices** — breathwork, stillness/body scan, loving-kindness/meta meditation, and synthesized sound sessions.
- **365 daily messages** — deterministic affirmations, quotes, devotionals, grounding prompts, breath cues, gratitude prompts, and resilience reflections.
- **Daily notifications** — rolling local notification window with deep links into message viewports.
- **Journal and coach-style reflection surfaces** — early scaffolding for personal insight and guided reflection.
- **PHQ-9 and GAD-7 screeners** — optional self-report instruments for reflection and longitudinal tracking, with sensitive-item flagging.
- **Local-first persistence** — app data persists through a typed AsyncStorage adapter that can later be replaced with Firebase, Supabase, or encrypted local storage.
- **Premium visual system** — animated dark canvas, glass cards, custom typography, haptics, SVG visualizations, and Expo Router navigation.

---

## Production Vision

MoodSignal should not become a random collection of wellness tools. The production product should behave like a compact personal operating system for emotional awareness, wise action, and long-term growth.

The app should help a user answer four questions:

1. **What state am I in?**
2. **Why might I be here?**
3. **What is the wisest next action?**
4. **Who am I becoming through repeated action?**

Every feature should support that loop.

### Seven Product Pillars

1. **Signal** — voice, self-report, screeners, journal, sleep, practices, and future wearable data.
2. **Awareness** — trends, emotional patterns, baseline shifts, reflection, and insight generation.
3. **Wisdom** — practical teachings from psychology, contemplative traditions, virtue ethics, purpose work, and habit formation.
4. **Practice** — breathwork, stillness, loving-kindness, sound, journaling, gratitude, forgiveness, visualization, service, and flow training.
5. **Purpose** — stewardship prompts and small acts of contribution that turn “I have no purpose” into “What needs care right now?”
6. **Growth** — virtues, identities, milestones, consistency, and long-term change without shallow gamification.
7. **Reflection** — evening review, daily learning, gratitude, repair, and tomorrow’s intention.

---

## Tech Stack

- React Native 0.76
- Expo SDK 52
- TypeScript
- Expo Router
- Reanimated 3
- react-native-svg
- expo-av for voice recording and metering
- expo-notifications
- expo-blur and expo-linear-gradient
- AsyncStorage
- Firebase dependency present, but production auth/backend still needs final integration

---

## Run Locally

```bash
npm install
npx expo start
```

Then scan the QR code with Expo Go on iOS or Android.

Microphone and notification features require a physical device or simulator support. For production builds:

```bash
eas build -p ios
eas build -p android
```

---

## Repository Structure

```text
app/                         Expo Router screens and route groups
  _layout.tsx                Root providers, fonts, notification routing
  index.tsx                  Boot gate: onboarding → sign-in → baseline → tabs
  onboarding.tsx             First-run introduction
  sign-in.tsx                Current auth surface; real auth still needed
  baseline.tsx               Voice baseline capture
  checkin.tsx                Voice check-in flow
  feel.tsx                   Self-report flow
  coach.tsx                  Guided reflection surface
  journal*.tsx               Journal surfaces
  breath.tsx                 Breath practice
  stillness.tsx              Body scan / stillness practice
  meta.tsx                   Loving-kindness practice
  sound.tsx                  Sound practice
  message/[id].tsx           Daily message viewport
  (tabs)/                    Main Today, Voice, Practices, 365, You experience

src/
  components/                Reusable design system and visual components
  context/AppContext.tsx     Global app state and persistence actions
  data/messages.ts           365-day message/content engine
  lib/                       Auth, storage, voice, notifications, screeners, audio, haptics
  theme/theme.ts             Color, type, spacing, radius, shadow tokens

scripts/
  gen-assets.js              Branded app icon/splash generation

docs/                        Product, roadmap, architecture, and production docs
```

---

## Production Status

MoodSignal is currently a strong prototype moving toward production readiness.

### Production blockers

- Replace dummy sign-in with real Firebase Auth, Google Sign-In, and anonymous auth upgrade flow.
- Decide whether sensitive user data remains local-only, encrypted local, or synced to a secure backend.
- Add formal privacy policy, terms, crisis/safety copy, and App Store compliance language.
- Add crash reporting, analytics, and structured error logging.
- Add test coverage for storage, voice heuristics, recommendations, screeners, and notification scheduling.
- Add accessibility pass for VoiceOver/TalkBack, larger text, reduced motion, and contrast.
- Run real-device QA for microphone, notifications, background behavior, and release builds.

### Near-term product buildout

- Production recommendation engine
- Wisdom library and wisdom-to-action mapping
- Purpose/stewardship module
- Evening reflection loop
- Progress and insight dashboard
- Content tagging system
- Safer crisis-resource experience
- App Store screenshots, description, and launch checklist

See [`docs/ROADMAP.md`](docs/ROADMAP.md) and [`docs/PRODUCTION_CHECKLIST.md`](docs/PRODUCTION_CHECKLIST.md).

---

## Documentation

- [`docs/PRODUCT_VISION.md`](docs/PRODUCT_VISION.md) — core philosophy and product direction
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — phased buildout plan
- [`docs/PRODUCTION_CHECKLIST.md`](docs/PRODUCTION_CHECKLIST.md) — release-readiness checklist
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — current architecture and target improvements
- [`docs/CONTENT_SYSTEM.md`](docs/CONTENT_SYSTEM.md) — messages, wisdom, purpose, and practice content model

---

## Development Principles

1. Recommend **one next step**, not ten options.
2. Prefer reflection and agency over diagnosis.
3. Make spiritual/wisdom material optional, practical, and non-coercive.
4. Keep the app local-first until sync and privacy are production-grade.
5. Treat all mental-health-adjacent language carefully.
6. Design for real people in activated states: fewer choices, calmer surfaces, clear exits.
7. Every module should strengthen the Signal → Awareness → Wisdom → Practice → Purpose → Growth loop.

---

## Safety Positioning

MoodSignal is for wellness, self-reflection, habit support, and guided practice. It does not provide medical advice. If a user may be in immediate danger or crisis, the app should direct them to local emergency services or appropriate crisis support.

Before release, all crisis-related flows, PHQ-9 sensitive-item handling, disclaimers, and app-store copy should be reviewed carefully.
