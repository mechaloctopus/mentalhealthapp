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
- `checkin.tsx` — voice recording, analysis, confirmation, and result.
- `feel.tsx` — self-report flow.
- `coach.tsx` — reflection/coach surface.
- `journal*.tsx` — journal surfaces.
- `breath.tsx`, `stillness.tsx`, `meta.tsx`, `sound.tsx` — practice routes.
- `message/[id].tsx` — deep-linked daily message viewport.
- `(tabs)/` — main tab navigation.

### State Layer

`src/context/AppContext.tsx` owns the current global state:

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
- recommendations

The voice layer is heuristic and should remain carefully described as a reflection aid.

### Notification Layer

`src/lib/notifications.ts` schedules local daily messages using a rolling window. This design avoids common iOS pending-notification limits while keeping daily content deterministic.

### Content Layer

`src/data/messages.ts` contains the daily message engine.

This should evolve into a richer tagged content system that can support recommendations, wisdom cards, purpose prompts, and practice pairings.

### Design System

`src/theme/theme.ts` and `src/components/` contain the visual system.

The existing direction is strong: dark, calm, premium, animated, and glass-like. Production work should improve accessibility and consistency without flattening the visual identity.

---

## Target Architecture

The production app should gradually separate into clearer domains:

```text
src/
  components/              shared UI primitives and visualizations
  context/                 app state provider and orchestration
  data/                    static/tagged content
  domains/
    signal/                voice, emotion, screeners, baselines
    practice/              sessions and practice definitions
    wisdom/                wisdom content and matching
    purpose/               stewardship prompts and completed actions
    insight/               trends and pattern detection
    safety/                crisis and sensitive-state handling
  lib/                     platform adapters and shared utilities
  theme/                   design tokens
```

This does not need to happen immediately. The app can stay functional while new modules are added.

---

## Recommended New Modules

### `src/lib/recommendationEngine.ts`

Central state-to-action engine.

Responsibilities:

- Accept current check-in, baseline, recent history, factors, and preferences.
- Return one primary recommendation.
- Return optional alternate.
- Explain the recommendation in one sentence.
- Avoid repeated suggestions.
- Escalate to safety content when needed.

### `src/data/wisdom.ts`

Static wisdom library.

Entries should be small, practical, and tagged.

Possible tags:

- emotion
- stress level
- virtue
- tradition
- practice type
- time of day
- user preference category

### `src/lib/wisdomEngine.ts`

Matches wisdom entries to current user state.

### `src/lib/purposeEngine.ts`

Generates stewardship prompts and purpose actions.

### `src/lib/insightEngine.ts`

Analyzes historical patterns.

Initial examples:

- common emotional states
- best practices for improvement
- factors correlated with stress
- time-of-day patterns
- practice consistency

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

### Dummy Auth

The current auth layer is demo-oriented. Production needs real auth or a deliberate local-only mode.

### Sensitive Local Data

AsyncStorage is not enough for sensitive journal or mental-health-adjacent data if production claims privacy. Decide and document the privacy model.

### Content Scale

As content grows, static files may become large and harder to review. Use typed entries and content tags early.

### Recommendation Logic

Recommendation logic should not remain scattered across screens. Centralize it before adding wisdom/purpose features.

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

High-value manual tests:

- fresh install route flow
- microphone denied flow
- short recording flow
- notification deep link
- reset all data
- sign out
- practice completion
- PHQ-9 sensitive item

---

## Production Principle

Screens should stay simple. Domain logic should live in typed library modules. Content should be tagged and reviewable. Safety behavior should be centralized. The app should recommend one useful next action instead of exposing implementation complexity to the user.
