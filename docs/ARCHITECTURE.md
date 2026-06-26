# MoodSignal Architecture

This document describes the current architecture and the target production direction.

---

## Current Architecture

MoodSignal is a React Native + Expo app using Expo Router.

### Route Layer

`app/` contains the route tree.

Important routes:

- `_layout.tsx` — root providers, fonts, splash behavior, notification handler, and stack navigation.
- `index.tsx` — boot gate that routes users through onboarding, sign-in, baseline, and the tab app.
- `onboarding.tsx` — intro flow.
- `sign-in.tsx` — local-first profile entry; Google account sign-in only appears when Google and Firebase config are both present.
- `baseline.tsx` — quality-checked voice baseline.
- `checkin.tsx` — voice recording, sample-quality validation, confirmation, wisdom/purpose recommendation, matched quest, and result.
- `feel.tsx` — manual self-report flow using the same recommendation and matched-quest model.
- `coach.tsx` — reflection/coach surface.
- `journal*.tsx` — journal surfaces.
- `breath.tsx`, `stillness.tsx`, `meta.tsx`, `sound.tsx` — practice routes connected to once-daily resonance and skill-tree rewards.
- `research.tsx` — PHQ-9, GAD-7, consent, export, and safety copy.
- `message/[id].tsx` — deep-linked daily message viewport.
- `(tabs)/` — main tab navigation.
- `side/` — Inner Path side-module stack.

### Side Module Routes

`app/side/` defines the side stack:

- `side/index.tsx` — resonance dashboard, mission stage, daily quests, wisdom paths, mentor, skill trees, compassion entry.
- `side/trees.tsx` — full skill tree overview.
- `side/mentor.tsx` — mentor guidance.
- `side/community.tsx` — private local compassion wall.
- `side/path/[id].tsx` — wisdom path detail.
- `side/quest/[id].tsx` — quest completion modal.

`SideProvider` now wraps the whole app in `app/_layout.tsx`, not just the side stack. This allows Today, Insights, Profile, check-ins, and practices to read and update Inner Path state.

### Core State Layer

`src/context/AppContext.tsx` owns the current global app state:

- user
- onboarding status
- baseline
- check-ins
- sessions
- journal
- screeners
- research consent
- saved messages
- notification and haptic preferences

It initializes a storage schema marker, uses a current-state ref for deterministic persistence, and cancels scheduled daily messages during full reset.

This is acceptable for prototype scale. For production, this file should remain an orchestration layer, while domain logic continues moving into pure library modules.

### Side State Layer

`src/side/SideContext.tsx` owns side-module state through the `sideState` storage key:

- resonance
- skill tree XP
- karma
- stewardship
- flow
- quest completions
- active paths
- daily quest ids and completions
- quest reflections

It now also owns the bridge from core practices to Inner Path rewards. Breath, Stillness, Loving-kindness, and Sound award resonance and skill-tree XP once per day. Quest and practice completion logic is split into pure helper functions so it can be tested.

### Storage Layer

`src/lib/storage.ts` is a typed wrapper over AsyncStorage.

`src/lib/storageVersion.ts` declares the current local schema version and initializes a version marker. Version 1 preserves existing local data as-is.

This is still not a complete production privacy architecture. Production must choose one of:

- encrypted local storage
- encrypted local database
- explicit secure sync
- hybrid local encrypted store plus optional encrypted backup

### Voice Layer

`src/lib/useRecorder.ts` handles microphone permissions, recording, metering, and cleanup.

`src/lib/voice.ts` turns metering data into reflective affect values:

- sample quality
- valence
- arousal
- energy
- calmness
- stability
- stress
- confidence
- emotion matching
- basic recommendations

The voice layer is heuristic and should remain carefully described as a reflection aid. It now rejects unusable samples instead of synthesizing fallback data.

### Recommendation Layer

`src/lib/recommendationEngine.ts` is the central state-to-action engine.

It returns:

- one primary practice
- one alternate practice
- duration
- category
- rationale
- wisdom card
- purpose/stewardship prompt

`src/lib/sideQuestMatcher.ts` connects a check-in to an existing Inner Path quest by using emotion, stress, energy, calmness, stability, factors, active paths, daily quests, and completed quests.

### Wisdom and Purpose Layer

`src/data/wisdom.ts` defines tagged wisdom cards.

`src/lib/purposeEngine.ts` defines purpose/stewardship prompts.

These remain lightweight scaffolds. Deeper production content already exists in `src/side/content.ts`, especially wisdom paths and quests. Future work should avoid duplication by connecting engines to side content.

### Side Content Layer

`src/side/content.ts` defines:

- `Quest`
- `QuestKind`
- `QuestGrants`
- `Path`
- `PathStage`
- `MissionStage`
- `MISSION`
- `DAILY_POOL`
- `PATHS`
- quest lookup helpers
- path lookup helpers

The Side Module content is data-driven. Adding a path should usually mean adding data, not new navigation code.

### Skill Tree Layer

`src/side/trees.ts` defines 11 skill trees:

- Mindfulness
- Compassion
- Purpose
- Wisdom
- Fitness
- Nutrition
- Relationships
- Leadership
- Service
- Creativity
- Flow

Tree levels are computed from XP and currently support up to 100 levels.

### Notification Layer

`src/lib/notifications.ts` schedules local daily messages using a rolling window. Notifications are opt-in. Daily-message cancellation is scoped to daily-message notifications instead of wiping every scheduled notification in the app.

### Content Layer

`src/data/messages.ts` contains the daily message engine.

This should evolve into a richer tagged content system that can support recommendations, wisdom cards, purpose prompts, practice pairings, and side-module quest recommendations.

### Design System

`src/theme/theme.ts` and `src/components/` contain the visual system.

The existing direction is strong: dark, calm, premium, animated, and glass-like. Production work should improve accessibility and consistency without flattening the visual identity.

---

## Target Architecture

The production app should gradually separate into clearer domains while preserving current working routes:

```text
src/
  components/              shared UI primitives and visualizations
  context/                 app state provider and orchestration
  data/                    static/tagged content
  side/                    Inner Path side module: resonance, quests, paths, trees, mentor
  domains/
    signal/                voice, emotion, screeners, baselines
    practice/              sessions and practice definitions
    wisdom/                wisdom content and matching
    purpose/               stewardship prompts and completed actions
    insight/               trends and pattern detection
    safety/                crisis and sensitive-state handling
    resonance/             side-module integration, quest matching, growth mapping
  lib/                     platform adapters and shared utilities
  theme/                   design tokens
```

This does not need to happen immediately. The app can stay functional while new modules are added.

---

## Existing Modules to Preserve

### `src/side/SideContext.tsx`

Side-module state, quest completion logic, and core-practice reward logic. Do not duplicate this with a separate side-quest store.

### `src/side/content.ts`

Main side quest and wisdom path source of truth. New side quests should usually be added here.

### `src/side/trees.ts`

Skill tree definitions and tree leveling.

### `src/side/mentor.ts`

Mentor nudge generation.

### `src/lib/recommendationEngine.ts`

Central state-to-action engine. Keep recommendation logic here rather than scattering it across screens.

### `src/lib/sideQuestMatcher.ts`

Adapter between check-ins and existing Inner Path quests.

---

## Recommended New / Extended Modules

### `src/lib/insightEngine.ts`

Analyzes historical patterns.

Initial examples:

- common emotional states
- best practices for improvement
- factors correlated with stress
- time-of-day patterns
- practice consistency
- resonance growth
- neglected skill trees

### `src/lib/safety.ts`

Centralizes safety and crisis logic.

Responsibilities:

- PHQ-9 sensitive-item interpretation
- emergency copy
- crisis route decisions
- safe language helpers

---

## Current Engineering Risks

### Sensitive Local Data

AsyncStorage is not enough for sensitive journal or mental-health-adjacent data if production claims privacy. Decide and document the privacy model before external beta.

### Global Context Growth

`AppContext` may become too large if every new feature adds state and actions there. Keep pure logic outside the context.

### Side Module Duplication

The side module already exists. Avoid creating duplicate quest, resonance, or skill-tree systems outside `src/side/`.

### Production Auth Decision

The app now has honest local-first behavior. Production still needs either a deliberate local-only launch decision or real account/sync infrastructure.

### Content Scale

As content grows, static files may become large and harder to review. Use typed entries and content tags early.

### Safety Copy

Safety logic should not be embedded ad hoc in UI screens. Centralize and test it.

---

## Testing Strategy

Prioritize pure functions first.

High-value unit tests:

- voice sample quality
- voice feature normalization
- baseline shift
- emotion matching
- screener scoring
- notification date selection and scoped cancellation
- recommendation selection
- wisdom matching
- purpose prompt generation
- safety escalation
- side quest matching
- daily quest generation
- quest completion
- practice reward duplicate prevention
- path progress
- tree leveling
- storage schema initialization

High-value manual tests:

- fresh install route flow
- local profile sign-in
- baseline record, poor sample, retry, skip
- voice check-in permission denied, poor sample, success
- manual check-in
- recommendation to practice
- recommendation to quest
- practice completion reward once per day
- notification enable, reschedule, preview, reset cancellation
- journal create/delete/export/reset
- screener flow and sensitive-item behavior
- full reset
- offline launch
- corrupt stored JSON recovery
- VoiceOver/TalkBack navigation
- dynamic text
- reduced motion
- physical-device iOS and Android release builds
