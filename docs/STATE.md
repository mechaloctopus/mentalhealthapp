# MoodSignal — Project State

_A Mended Light app. This document is the single source of truth for where the project
stands. Last updated alongside the coherence-audit + mystery-school + effects work._

## 1. What it is
A premium mental-health & contemplative-growth app (React Native + Expo, runs in Expo Go
on iOS/Android). Two layers:
- **Core dashboard** — daily voice/self check-ins across 12 emotions, 365 daily messages,
  guided practices, journaling, a CBT/DBT guide, insights, and notifications.
- **The Inner Path (Side Module)** — an "operating system for wisdom & flourishing":
  Resonance progression, six mission stages, skill trees, optional wisdom paths
  (a mystery-school curriculum), an on-device mentor, and a private community space.

## 2. Stack & architecture
- Expo SDK 52 · React Native 0.76 · TypeScript (strict) · Expo Router.
- Reanimated 3 · react-native-svg · expo-av (voice/audio) · expo-notifications · AsyncStorage.
- State: `AppContext` (core) + `SideContext` (Inner Path), both behind a typed storage adapter
  (`src/lib/storage.ts`) — local-first, ready to swap for encrypted/sync later.
- Layout: `app/` = Expo Router screens; `src/components` = UI kit + effects + sacred geometry;
  `src/lib` = domain logic; `src/side` = Inner Path content & state; `src/theme` = design tokens.

## 3. Core dashboard — status: ✅ implemented
- **Emotion engine:** 12-emotion valence/arousal model; voice check-in (mic + on-device
  acoustic features → emotion + confidence) and a self-report emotion wheel.
- **365 daily messages** with a full-screen viewport (deep-linked from notifications).
- **Practices:** Breath, Stillness (body scan), Loving-kindness, Sound, Sleep mixer.
- **Journaling** with adaptive prompts; **CBT/DBT guide** (on-device guided reflection).
- **Insights** rebuilt around Resonance + skill-tree progress (coherence-audit).
- **Notifications:** opt-in daily messages (no broad cancellation; ids are managed).
- **Research & data:** optional PHQ-9 / GAD-7 screeners, consent, JSON export.

## 4. The Inner Path (Side Module) — status: ✅ implemented, expanding
- **Resonance** is the single growth currency. Practices and quests award it; it drives the
  **six mission stages** (Stabilize → Heal → Habits → Purpose → Wisdom → Service) and grows
  **11 skill trees**.
- **Wisdom paths** (data-driven, `src/side/content.ts`): Five Temples (Gospel of Mary),
  Seven Habits, Acts of Stewardship, The Way of Mushin, Heart Coherence, The Bodhisattva Path,
  The Stoic Path, The Wisdom Library.
- **Mystery-school depth** (`src/side/pathContext.ts`): each path now carries its *concept*,
  *source material* (honestly cited — see `docs/CONTENT_SOURCES.md`), how we practice it, and
  per-stage teachings. Surfaced in the path detail screen.
- **Daily quests:** universal pool (coherence, gratitude, metta, breath awareness, self-inquiry,
  impermanence, forgiveness, kindness) + active-path quests.
- **Mentor:** on-device personalized guidance from the user's own mood + activity.
- **Community:** a private, local compassion space (presence + sit, weekly challenge, a wall
  the user writes to) — clearly labeled as a preview pending a real backend.

## 5. Special effects & visual language — status: ✅ new this pass
- **Sacred geometry** (`src/components/sacred/Geometry.tsx`): Merkaba (star tetrahedron),
  Flower of Life, toroidal rings, midpoint-displacement lightning.
- **ResonanceMeter** (`src/components/effects/ResonanceMeter.tsx`): an etheric "forcefield" —
  breathing radial glow, rotating harmonic rings, a turning Merkaba core, and static lightning
  arcs that crackle more as Resonance rises. Used on the Inner Path home.
- **EtherealBar** (`src/components/effects/EtherealBar.tsx`): glowing/pulsing stat bars in four
  styles — **plasma**, **crystalline**, **pulse**, **aurora** — used across skill trees.
- All effects honor the OS **Reduce Motion** setting.

## 6. Branding — status: ✅ compliant (Mended Light)
- Fonts: **Alegreya SC** (display), **Alegreya** (serif), **Open Sans** (body) — loaded and used
  via `font` tokens; no off-brand font references remain.
- Palette: violet `#80237B` · indigo `#1F3277` · teal `#064559` · blue `#3085AC` (+ white),
  adapted for the dark canvas; the **flame** gradient + Merkaba mark carry the identity.
- Full brand guide cloned to `/branding`; details in `docs/BRANDING.md`.
- Outstanding: drop the licensed **logo PNG** into the icon/splash + an in-app wordmark
  (the Aire Bold Pro script only exists in the logo art).

## 7. Build & CI — status: ⚠️ see notes
- `tsc --noEmit` clean; `npm run check` (tsc + repo invariants) passes.
- **CI** (`.github/workflows`): "TypeScript and invariants" + "Build debug APK".
  - The invariant check was made precise (no false positives on prose / generated files).
  - **Architecture:** the app uses the proven old architecture for release builds. The CI
    builds a **debug** APK; on RN 0.76 the debug `ReactAndroid` prefab is only provided under
    the New Architecture, so a debug build may need new arch enabled or the job pointed at the
    release output. This is validated against the real runner once Actions are enabled.
  - **Runner/billing:** ensure GitHub Actions is enabled and within budget (Settings → Actions,
    Billing) — otherwise jobs fail instantly with no runner assigned.

## 8. Documentation index
- `docs/STATE.md` — this file (overall state).
- `docs/CONTENT_SOURCES.md` — curriculum bibliography & editorial principles.
- `docs/BRANDING.md` — Mended Light brand application.
- `docs/COHERENCE_AUDIT.md` — product-coherence audit & ordering.
- `docs/PRIVACY_ARCHITECTURE.md` · `docs/MANUAL_QA.md` · `docs/APK_BUILD.md` — privacy, QA, build.
- `docs/AUDIT.md` · `docs/UPGRADE_PLAN.md` — earlier production audit & roadmap.

## 9. Open work (prioritized)
1. Confirm the debug-APK CI job on a live runner; finalize arch/release decision.
2. Real logo art into icon/splash + wordmark.
3. Deepen remaining paths to the Gospel-of-Mary level of per-stage teaching.
4. Backend (Supabase): accounts, encrypted sync, live community, Claude-powered mentor.
5. Onboarding goal personalization & empty/skeleton states (in progress on a parallel branch).
6. Unit tests for pure logic (emotions, insights, screeners) + expand CI.
