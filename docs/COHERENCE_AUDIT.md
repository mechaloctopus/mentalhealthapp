# MoodSignal Production Coherence Audit

This audit reviews MoodSignal as one product rather than a collection of screens.

## Canonical Product Loop

```text
Daily word → Check in → Confirm the signal → Receive one wise next step →
Practice or complete a quest → Gain resonance → Grow skill trees →
Advance the Inner Path → Review patterns
```

## Canonical Growth Model

MoodSignal has one growth system:

- **Resonance** — the primary growth currency.
- **Mission stage** — the current Inner Path chapter.
- **Skill trees** — areas of practiced growth.
- **Daily quests** — small actions that grant resonance and tree progress.
- **Wisdom paths** — optional structured practice journeys.
- **Karma, stewardship, and flow** — specialized contribution counters.
- **Activity rhythm** — consistency information, not a currency.

Lumen must not operate as a second economy. It may remain only as optional visual language that reflects resonance and skill-tree growth.

## Completed Coherence Work

### One app-wide Inner Path state

`SideProvider` now wraps the entire app.

This enables:

- live resonance on Today
- mission-stage and skill-tree progress in Insights
- matched quests after both check-in methods
- practice-to-resonance awards
- consistent reset behavior

### Simplified Today dashboard

Today now follows a clear hierarchy:

1. Today’s word
2. Check in
3. Inner Path status and next quest
4. Explore practices, reflection, journal, and insights

The separate Lumen progression panel and explanatory daily-flow panel were removed.

### Unified Insights

Insights now shows:

- resonance
- current mission stage
- progress to next stage
- activity rhythm
- all 11 skill-tree levels
- emotion distribution
- factor associations
- voice baseline
- calmness trend
- check-in history

The previous independent points/levels/badges economy was removed from this screen.

### Voice and manual check-in parity

Both methods now lead to:

- confirmed feeling
- one recommended practice
- rationale
- wisdom card
- purpose-through-care prompt
- matched Inner Path quest

### Honest voice-quality handling

Voice analysis no longer creates synthetic meter data.

Poor samples now:

- return no affect result
- are not saved as a baseline
- are not saved as a check-in
- offer retry or manual emotion selection

### Core practices advance the Inner Path

Core practices now grant resonance and skill-tree progress once per day:

| Practice | Resonance | Skill trees |
|---|---:|---|
| Breath | 15 | Mindfulness |
| Stillness | 15 | Mindfulness, Wisdom |
| Loving-kindness | 18 | Compassion, Relationships |
| Sound | 12 | Mindfulness, Flow |

Breath and Stillness fulfill their matching canonical daily quest when it is active. Duplicate awards are blocked for the same day.

### Honest sign-in

- No simulated Google identity is shown.
- Local profile mode is the default when production auth is unavailable.
- Copy states that cloud sync is not enabled.
- Returning users with a baseline skip duplicate baseline capture.

### Explicit notification consent

Daily notifications now default to disabled and are enabled from Profile.

### Honest community preview

The community screen no longer shows:

- simulated people present
- synthetic collective totals
- seeded anonymous posts
- fake hearts or engagement

It is now an explicitly private local compassion wall until a real moderated backend exists.

### Reset coherence

Reset All clears both core state and live Inner Path state.

### Accessibility improvements

Added labels and selected-state metadata to:

- emotion-wheel choices
- context-factor choices
- breathing pattern choices
- breathing duration choices
- sound preset choices
- key icon-only controls

A full device accessibility pass is still required.

### Practice-content cleanup

The generic fasting recommendation was removed. Supportive habits now focus on steady nourishment and sleep/screen boundaries.

### CI

`.github/workflows/ci.yml` now runs `npm ci` and `npm run lint` on pull requests and pushes to `main`.

## Current Navigation Model

### Primary tabs

- **Today** — daily orientation and next action
- **Insights** — patterns, resonance, stages, and skill trees
- **Practices** — direct practice library
- **365** — daily message archive
- **You** — preferences, data, Inner Path access, sign-out, and reset

### Secondary flows

- voice check-in
- manual check-in
- baseline
- guided reflection
- journal
- sleep mixer
- research/screeners
- individual practices
- Inner Path routes

## Remaining P0 Release Blockers

These must be resolved before public release.

### 1. Sensitive data storage

Check-ins, journal text, screeners, and reflections currently use AsyncStorage.

Required:

- choose encrypted local storage, encrypted local database, or explicit secure sync
- define retention and migration strategy
- test export and deletion
- publish privacy policy and terms

### 2. Crisis-support flow

The app has safety copy but no dedicated locale-aware crisis route.

Required:

- dedicated safety screen
- immediate-danger action
- trusted-person action
- country-appropriate resources
- tested PHQ-9 item 9 behavior
- qualified safety/copy review

### 3. Production authentication decision

Choose one:

- intentional local-only launch, or
- real Firebase authentication and explicit sync consent

Do not imply account sync until it exists.

### 4. Build and device validation

Required:

- CI must pass
- Expo iOS and Android release builds
- physical-device microphone testing
- physical-device notification and deep-link testing
- interrupted audio-session testing
- offline and corrupted-storage testing

### 5. Accessibility validation

Required:

- VoiceOver and TalkBack smoke tests
- dynamic text
- screen-reader order
- contrast review
- reduced-motion review
- 44-point touch targets
- textual chart summaries

### 6. Copyright and attribution audit

Daily messages and wisdom content need source verification.

Required:

- verify quotations and attribution
- replace uncertain quotations with original paraphrases
- avoid long copyrighted passages
- maintain a content-review record

## Remaining P1 Product Work

- Shared check-in result component to remove duplicated voice/manual result UI
- Track recommendation accepted, skipped, and completed outcomes
- Evening reflection and weekly review
- Configurable wisdom/spiritual preferences
- Storage schema versioning and migrations
- Error telemetry and non-sensitive analytics
- Decide whether the private compassion wall ships or stays hidden
- Remove or repurpose dead Lumen/progress code after CI confirms no imports
- Review `supportsTablet: true` against actual tablet layout and App Store obligations

## Production Language Rules

Use:

- signal
- estimate
- reflection
- pattern
- association
- practice
- recommendation
- resonance

Avoid:

- diagnosis
- proof
- treatment claim
- guaranteed healing
- simulated social proof
- sync claims when data is local

## External Beta Acceptance Criteria

- [ ] CI passes.
- [x] Poor voice samples produce retry, never fabricated analysis.
- [x] Manual and voice check-ins use the same result model.
- [x] Core practices visibly connect to resonance and skill trees.
- [x] Simulated community activity is removed.
- [x] Notification permission is explicitly opt-in.
- [ ] Sensitive local data has a release-approved privacy architecture.
- [ ] Export and full deletion are tested.
- [ ] Crisis flow is reviewed and tested.
- [ ] Accessibility smoke test passes.
- [ ] iOS and Android release builds pass on physical devices.
- [ ] App Store copy avoids clinical and unsupported claims.
- [ ] Content attribution review is complete.
