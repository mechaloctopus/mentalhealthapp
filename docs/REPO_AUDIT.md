# MoodSignal Repo Audit

This document tracks documentation accuracy, cleanup findings, and production-readiness risks discovered during repo review.

---

## Confirmed Current Structure

### Core routes

- `app/_layout.tsx` — root app providers, fonts, splash behavior, notification routing, stack navigation.
- `app/index.tsx` — boot gate.
- `app/onboarding.tsx` — onboarding.
- `app/sign-in.tsx` — demo sign-in surface.
- `app/baseline.tsx` — voice baseline capture.
- `app/checkin.tsx` — voice check-in and result surface.
- `app/feel.tsx` — self-report emotion flow.
- `app/coach.tsx` — guided reflection.
- `app/journal*.tsx` — journal flow.
- `app/research.tsx` — PHQ-9/GAD-7, consent, export, safety copy.
- `app/sleep.tsx` — sleep/sound surface.
- `app/message/[id].tsx` — daily message modal.

### Tab routes

- `app/(tabs)/index.tsx` — Today dashboard.
- `app/(tabs)/voice.tsx` — Insights.
- `app/(tabs)/practices.tsx` — practices.
- `app/(tabs)/messages.tsx` — 365 messages.
- `app/(tabs)/profile.tsx` — profile/preferences/research links/reset.

### Side module routes

- `app/side/_layout.tsx` — side stack and `SideProvider`.
- `app/side/index.tsx` — Inner Path dashboard.
- `app/side/trees.tsx` — skill trees.
- `app/side/mentor.tsx` — mentor.
- `app/side/community.tsx` — community/gathering surface.
- `app/side/path/[id].tsx` — path detail.
- `app/side/quest/[id].tsx` — quest modal.

### Core modules

- `src/context/AppContext.tsx`
- `src/lib/storage.ts`
- `src/lib/auth.ts`
- `src/lib/authConfig.ts`
- `src/lib/firebase.ts`
- `src/lib/useRecorder.ts`
- `src/lib/voice.ts`
- `src/lib/emotions.ts`
- `src/lib/screeners.ts`
- `src/lib/notifications.ts`
- `src/lib/recommendationEngine.ts`
- `src/lib/sideQuestMatcher.ts`
- `src/lib/purposeEngine.ts`
- `src/lib/safety.ts`
- `src/data/messages.ts`
- `src/data/wisdom.ts`

### Side modules

- `src/side/SideContext.tsx`
- `src/side/content.ts`
- `src/side/trees.ts`
- `src/side/mentor.ts`

---

## Documentation Reconciliation Completed

- [x] README updated to reflect the actual side module.
- [x] Roadmap updated to mark existing side module capabilities as already built.
- [x] Architecture doc updated to include side-module architecture.
- [x] Content system doc updated to treat `src/side/content.ts` as the side quest/path source of truth.
- [x] Production checklist updated with real current progress.
- [x] Product vision updated to include Resonance / Inner Path.
- [x] Side module doc added.
- [x] Onboarding copy updated to mention Inner Path and resonance.
- [x] Today daily-flow copy updated to mention wisdom, quests, and resonance.

---

## Cleanup Applied

### Removed stale storage key

Removed `KEYS.notificationsScheduled` from `src/lib/storage.ts`.

Reason: current notification scheduling uses `expo-notifications` directly and no inspected code references this key.

### Removed unused Today imports

Removed unused `BrandMark` and `Divider` imports from `app/(tabs)/index.tsx`.

Reason: the file did not render either symbol.

### Removed stale Today copy

Updated the Today daily-flow list from:

```text
Notification prompt → Voice check-in → Mood profile → Matched practice → Trend archive
```

to:

```text
Daily word → Check in → Wise next step → Practice or quest → Insight + resonance
```

Reason: the old copy did not reflect wisdom cards, purpose prompts, or the Side Module.

### Updated onboarding copy

Updated onboarding from “Four gentle pillars” to a clearer five-slide onboarding sequence covering:

- voice signal
- one wise next step
- wisdom/purpose/practices
- Inner Path resonance
- 365 daily messages

---

## Potential Redundancies / Watch Items

### Recommendation content vs side content

There are now two lightweight recommendation content sources:

- `src/data/wisdom.ts`
- `src/lib/purposeEngine.ts`

And one richer side content source:

- `src/side/content.ts`

This is acceptable as a transitional architecture, but production should avoid divergence.

Mitigation added: `src/lib/sideQuestMatcher.ts` now bridges recommendations to existing side quests instead of growing a parallel quest/purpose system.

### Stored check-in recommendation vs new recommendation engine

`src/lib/voice.ts` still embeds a basic recommendation inside each saved `CheckIn`.

`app/checkin.tsx` now computes a richer `nextStep` from `src/lib/recommendationEngine.ts` for the result screen.

This is acceptable for backward compatibility. Long term, decide whether saved check-ins should store:

- the basic recommendation snapshot,
- the richer recommendation snapshot,
- or only raw state, with recommendation computed at display time.

### Demo auth vs production auth

`src/lib/auth.ts` is still a dummy auth layer. `src/lib/authConfig.ts` and `src/lib/firebase.ts` show a real-auth path, but the production sign-in flow still needs implementation.

### AsyncStorage privacy

Core state and side state persist locally through AsyncStorage. This is good for prototype speed but not enough for sensitive production claims.

### SideProvider scope

`SideProvider` currently wraps only the `app/side/` stack. This keeps side state isolated, but it means the main Today tab cannot show live side-module stats unless:

1. Side state is lifted to root, or
2. a read-only side-state hook/loader is created for dashboard surfaces, or
3. Today links into the side module without live stats.

The current Today dashboard uses option 3.

### Dependency audit needed locally

`package.json` includes several font packages. The current root layout imports Alegreya, Alegreya SC, and Open Sans. A local dependency audit should confirm whether the Cinzel, Inter, and Newsreader font packages are still needed before removing them from `package.json` and lockfiles.

---

## Recommended Next Cleanup / Refactor Pass

1. Wire `src/lib/sideQuestMatcher.ts` into `src/lib/recommendationEngine.ts` once side state is readable where recommendations are produced.
2. Add tests for pure functions before larger refactors.
3. Decide whether `CheckIn.recommendation` should remain stored.
4. Add a root-accessible side progress summary if the Today dashboard should show live resonance.
5. Add CI for `npm run lint` / `tsc --noEmit`.
6. Run a local TypeScript check and fix any unused imports the compiler reports.
7. Run a local dependency audit before removing package dependencies.

---

## Manual Verification Needed

Because this review was done through GitHub file access rather than a local clone, the following still need local validation:

- `npm install`
- `npm run lint`
- `npx expo start`
- iOS simulator or device test
- Android device test
- voice recording test
- notification scheduling/deep-link test
- side quest completion test
- reset/export test
