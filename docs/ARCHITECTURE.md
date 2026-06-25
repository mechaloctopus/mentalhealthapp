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
- `sign-in.tsx` — current auth surface.
- `baseline.tsx` — first voice baseline.
- `checkin.tsx` — voice recording, analysis, confirmation, wisdom/purpose recommendation, and result.
- `feel.tsx` — self-report flow.
- `coach.tsx` — reflection/coach surface.
- `journal*.tsx` — journal surfaces.
- `breath.tsx`, `stillness.tsx`, `meta.tsx`, `sound.tsx` — practice routes.
- `research.tsx` — PHQ-9, GAD-7, consent, export, and safety copy.
- `message/[id].tsx` — deep-linked daily message viewport.
- `(tabs)/` — main tab navigation.
- `side/` — Inner Path side-module stack.

### Side Module Routes

`app/side/_layout.tsx` wraps side routes in `SideProvider` and defines the side stack:

- `side/index.tsx` — resonance dashboard, mission stage, daily quests, wisdom paths, mentor, skill trees, community entry.
- `side/trees.tsx` — full skill tree overview.
- `side/mentor.tsx` — mentor guidance.
- `side/community.tsx` — gathering/community surface.
- `side/path/[id].tsx` — wisdom path detail.
- `side/quest/[id].tsx` — quest completion modal.

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

This is acceptable for prototype scale. For production, this file should remain an orchestration layer, but domain logic should continue moving into pure library modules.

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

The side module is already meaningfully implemented and should not be recreated. Production work should focus on integrating it into the main dashboard and recommendation engine.

### Storage Layer

`src/lib/storage.ts` is a typed wrapper over AsyncStorage.

This is good because screens do not directly depend on AsyncStorage. Production can replace or augment this with:

- encrypted local storage
- SQLite
- Firebase
- Supabase
- optional encrypted backup

### Voice Layer

`src/lib/useRecorder.ts` handles microphone permissions, recording, metering, and cleanup.

`src/lib/voice.ts` turns metering data into reflective affect values:

- valence
- arousal
- energy
- calmness
- stability
- stress
- confidence
- emotion matching
- basic recommendations

The voice layer is heuristic and should remain carefully described as a reflection aid.

### Recommendation Layer

`src/lib/recommendationEngine.ts` is the current central state-to-action engine.

It currently returns:

- one primary practice
- one alternate practice
- duration
- category
- rationale
- wisdom card
- purpose/stewardship prompt

Next production step: connect it to the existing side quest system so a check-in can recommend a specific side quest.

### Wisdom and Purpose Layer

`src/data/wisdom.ts` defines tagged wisdom cards.

`src/lib/purposeEngine.ts` defines purpose/stewardship prompts.

These are lightweight scaffolds. The deeper production content already exists in `src/side/content.ts`, especially wisdom paths and quests. Future work should avoid duplication by connecting the engines to side content.

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

`src/lib/notifications.ts` schedules local daily messages using a rolling window. This design avoids common iOS pending-notification limits while keeping daily content deterministic.

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

Side-module state and quest completion logic. Do not duplicate this with a separate side-quest store.

### `src/side/content.ts`

Main side quest and wisdom path source of truth. New side quests should usually be added here.

### `src/side/trees.ts`

Skill tree definitions and tree leveling.

### `src/side/mentor.ts`

Mentor nudge generation.

---

## Recommended New / Extended Modules

### `src/lib/recommendationEngine.ts`

Central state-to-action engine.

Next responsibilities:

- Accept current check-in, baseline, recent history, factors, preferences, and side-module state.
- Return one primary recommendation.
- Return optional alternate.
- Explain the recommendation in one sentence.
- Avoid repeated suggestions.
- Recommend a specific side quest when appropriate.
- Escalate to safety content when needed.

### `src/lib/sideQuestMatcher.ts`

Future adapter between the recommendation engine and existing `src/side/content.ts` quests.

Responsibilities:

- Match emotion/stress/energy/factors to existing quests.
- Prefer active path quests when relevant.
- Avoid completed non-repeatable quests.
- Prefer unfinished daily quests.
- Return a quest id and reason.

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

### Global Context Growth

`AppContext` may become too large if every new feature adds state and actions there. Keep pure logic outside the context.

### Side Module Duplication

The side module already exists. Avoid creating duplicate quest, resonance, or skill-tree systems outside `src/side/`. New recommendation logic should point into the existing side content.

### Dummy Auth

The current auth layer is demo-oriented. Production needs real auth or a deliberate local-only mode.

### Sensitive Local Data

AsyncStorage is not enough for sensitive journal or mental-health-adjacent data if production claims privacy. Decide and document the privacy model.

### Content Scale

As content grows, static files may become large and harder to review. Use typed entries and content tags early.

### Recommendation Logic

Recommendation logic should not remain scattered across screens. Centralize it and connect to side-module content.

### Safety Copy

Safety logic should not be embedded ad hoc in UI screens. Centralize and test it.

---

## Testing Strategy

Prioritize pure functions first.

High-value unit tests:

- voice feature normalization
- baseline shift
- emotion matching
- screener scoring
- notification date selection
- recommendation selection
- wisdom matching
- purpose prompt generation
- safety escalation
- daily quest generation
- quest completion
- path progress
- tree leveling
- future side quest matching

High-value manual tests:

- fresh install route flow
- microphone denied flow
- short recording flow
- notification deep link
- reset all data
- sign out
- practice completion
- PHQ-9 sensitive item
- side-module dashboard
- quest completion modal
- path activation
- skill tree screen

---

## Production Principle

Screens should stay simple. Domain logic should live in typed library modules. Content should be tagged and reviewable. Safety behavior should be centralized. The app should recommend one useful next action and connect that action to long-term resonance, wisdom paths, and skill-tree growth without exposing implementation complexity to the user.
