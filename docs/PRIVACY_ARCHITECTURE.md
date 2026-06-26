# MoodSignal Privacy Architecture Plan

This document defines the current data posture and the production target before external beta.

## Current state

MoodSignal is currently local-first.

Data is stored on the device using the app storage adapter in `src/lib/storage.ts`, backed by AsyncStorage. The app now also initializes a storage schema marker through `src/lib/storageVersion.ts`.

Current local data categories include:

- local profile
- onboarding status
- voice baseline metrics
- check-ins
- practice sessions
- journal entries
- screener results
- saved daily messages
- preferences
- Inner Path state: resonance, quests, paths, tree XP, reflections, karma, stewardship, and flow

Current reset behavior:

- clears app storage
- clears Inner Path state
- cancels scheduled daily-message notifications
- reinitializes the storage schema marker

Current export behavior:

- exports a JSON payload through the platform share sheet
- includes app state and Inner Path state

## Production decision required

Before external beta, choose one of these architectures.

### Option A — Local-only encrypted release

Best for a privacy-forward v1.

Required:

- add encrypted storage for sensitive values
- keep account sync disabled
- explain clearly that uninstalling may remove data
- keep export manual
- support full local deletion

Recommended direction:

- use a secure key/value store for small secrets and encryption keys
- use encrypted database or encrypted payload storage for larger records
- keep AsyncStorage only for non-sensitive preferences or cache

### Option B — Local-first with optional account sync

Best for later multi-device use.

Required:

- explicit sync consent
- production authentication
- backend security rules
- account deletion
- backend data export
- conflict strategy between local and cloud records

This should not ship until the privacy policy, terms, backend rules, and account deletion path are complete.

### Option C — Prototype local storage only

Acceptable for internal development only.

Requirements:

- no public privacy claims beyond local prototype behavior
- no external beta with sensitive long-term user data
- no cloud sync claims
- clear warning in release notes

## Recommended v1 path

Ship v1 as **local-only encrypted** unless account sync becomes a hard requirement.

Rationale:

- simpler compliance surface
- no backend security-rule dependency
- honest alignment with the current product
- better fit for private journals and emotional check-ins
- easier App Store review narrative

## Implementation milestones

### Milestone 1 — Data classification

Create a typed data inventory:

| Category | Current key | Sensitivity | Production storage |
|---|---|---:|---|
| Preferences | `prefs` | low | AsyncStorage or encrypted store |
| Saved messages | `savedMessages` | low | AsyncStorage |
| User profile | `user` | medium | encrypted store |
| Baseline metrics | `baseline` | medium | encrypted store/database |
| Check-ins | `checkins` | high | encrypted store/database |
| Journal | `journal` | high | encrypted store/database |
| Screeners | `screeners` | high | encrypted store/database |
| Inner Path reflections | `sideState.reflections` | high | encrypted store/database |
| Inner Path progress | `sideState` | medium | encrypted store/database |

### Milestone 2 — Storage adapter split

Keep the current `storage.ts` adapter but split responsibilities:

```text
src/lib/storage.ts           generic adapter interface
src/lib/plainStorage.ts      non-sensitive AsyncStorage implementation
src/lib/privateStorage.ts    encrypted/private implementation
src/lib/storageVersion.ts    schema version + migrations
```

Screens and contexts should not import AsyncStorage directly.

### Milestone 3 — Migration

Add migration from schema 1 to schema 2:

1. read existing AsyncStorage values
2. write sensitive values to private storage
3. keep low-risk preferences in plain storage
4. mark migration complete
5. retain export/reset behavior

### Milestone 4 — User-facing copy

Add clear privacy copy in:

- onboarding
- sign-in
- profile
- export screen
- App Store privacy notes

Required language:

- where data is stored
- whether sync exists
- what happens on reset
- what happens on uninstall
- how export works
- what is not collected

### Milestone 5 — Testing

Test on physical iOS and Android:

- fresh install
- upgrade with existing schema 1 data
- export before and after migration
- reset after migration
- offline launch
- corrupted local values
- notification reset behavior

## Non-negotiable rules

- Do not imply cloud sync unless sync exists.
- Do not imply encryption until encryption is implemented.
- Do not store raw audio unless the user explicitly opts in and the policy says so.
- Do not upload wellness data for research until a real consent and backend process exists.
- Do not use simulated social proof or fake activity counts.

## Current status

Completed:

- local-first sign-in copy
- simulated Google identity removed
- storage schema marker added
- reset cancels daily notifications
- side state included in export/reset
- obsolete Lumen progression removed

Remaining before external beta:

- choose encrypted local storage or secure sync
- implement chosen private storage path
- write schema 2 migration
- add privacy policy and terms
- run physical-device export/reset tests
