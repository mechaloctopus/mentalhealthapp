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
  per-stage teachings. Surfaced in the path detail screen. Five Temples, The Stoic Path, and
  The Bodhisattva Path are now multi-stage progressions (4–5 stages each) with a teaching per
  stage; the rest remain single-stage and are next in line to deepen.
- **Daily quests:** universal pool (coherence, gratitude, metta, breath awareness, self-inquiry,
  impermanence, forgiveness, kindness) + active-path quests.
- **Mentor:** on-device personalized guidance from the user's own mood + activity.
- **Community:** a private, local compassion space (presence + sit, weekly challenge, a wall
  the user writes to) — clearly labeled as a preview pending a real backend.

## 4b. Cosmic Rim — status: ✅ new this pass, separate from the Inner Path
A planetary energy & position guide (`app/cosmic/`, `src/lib/astronomy.ts`,
`src/data/cosmicRim.ts`) — not gamified, not part of Resonance. Real geocentric
ecliptic-longitude positions for the 7 classical planets and moon-phase data come
from `astronomy-engine` (no fake/seeded data — enforced by
`scripts/check-invariants.mjs`). Includes a live zodiac wheel, per-planet
myth/Agrippa-correspondence/archangel detail screens, a local-only birth-chart
"echo" overlay, a moon watcher guide, and a Chaldean planetary-hours guide. A
moon-phase widget also sits on the main dashboard independent of the module. Full
scope, sources, and known v1 limitations (no location input yet, midday default
for birth time) in `docs/COSMIC_RIM.md`.

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

## 7. Build & CI — status: ✅ green on the real runner
- `tsc --noEmit` clean; `npm run check` (tsc + repo invariants) passes locally and in CI.
- **CI** (`.github/workflows`): both "TypeScript and invariants" and "Build debug APK" are
  passing on `chatgpt/coherence-audit` (PR #3) against a real GitHub Actions runner — the
  earlier CXX1210 prefab concern (debug `ReactAndroid` under old architecture on RN 0.76) was a
  local-sandbox build-cache artifact, not a real defect; the proven old-architecture config
  builds the debug APK successfully.
- The invariant check is precise (no false positives on prose / generated files).

## 8. Documentation index
- `docs/STATE.md` — this file (overall state).
- `docs/CONTENT_SOURCES.md` — curriculum bibliography & editorial principles.
- `docs/COSMIC_RIM.md` — the planetary energy/position module: scope, sources, limitations.
- `docs/AFFILIATE_MARKETING.md` — Amazon Associates feasibility & implementation plan.
- `docs/ULTRA_PREMIUM_CHECKLIST.md` — cross-referenced launch checklist + honest quality assessment.
- `docs/BRANDING.md` — Mended Light brand application.
- `docs/COHERENCE_AUDIT.md` — product-coherence audit & ordering.
- `docs/PRIVACY_ARCHITECTURE.md` · `docs/MANUAL_QA.md` · `docs/APK_BUILD.md` — privacy, QA, build.
- `docs/AUDIT.md` · `docs/UPGRADE_PLAN.md` — earlier production audit & roadmap.

## 9. Open work (prioritized)
1. Real logo art into icon/splash + wordmark.
2. Deepen the remaining paths (Habits, Purpose, Flow, Coherence, Wisdom Library) to the
   multi-stage, per-stage-teaching depth now shared by Five Temples, Stoic, and Bodhisattva.
3. Backend (Supabase): accounts, encrypted sync, live community, Claude-powered mentor.
4. Unit tests for pure logic (emotions, insights, screeners) + expand CI.

## 10. Onboarding & polish — status: ✅ new this pass
- **Goal personalization:** a new `app/goals.tsx` step after the onboarding carousel lets users
  pick what brought them ("a calmer mind," "better sleep," "find more purpose," …); stored as
  `prefs.focus` (`src/context/AppContext.tsx`) and surfaced as a one-line tailored greeting on
  the home screen (`focusLine()` in `src/lib/focus.ts`).
- **First steps:** the home screen shows a fading checklist (first voice check-in, first
  practice, first journal entry) for new users — gone once each is tried or after 5 check-ins.
- **Consistent empty/info affordances:** `src/components/EmptyState.tsx` (gentle empty-list
  card with optional CTA, now used in Journal) and `src/components/InfoSheet.tsx`'s
  `InfoButton` (an "i" affordance opening a bottom-sheet explanation — used on the Inner Path's
  Resonance meter to explain mission stages and the forcefield) replace one-off inline copy.
- `src/components/PressableCard.tsx` standardizes tap feedback (scale + haptic) for future use.
