# MoodSignal Production Coherence Audit

This audit reviews the merged app as one product rather than a collection of screens. It covers the daily user loop, navigation, growth system, data ownership, safety, privacy, accessibility, content, and release readiness.

## Executive assessment

MoodSignal has a strong visual identity and a substantial prototype. The central product idea is clear:

```text
Check in → Understand the signal → Receive one next step → Practice or complete a quest → Gain resonance → Grow skill trees
```

The largest coherence problem was competing growth systems. Core activity previously produced separate Lumen points, levels, and badges while the Inner Path used resonance, mission stages, and skill trees. Resonance is now the canonical growth currency in the main product surfaces. Skill-tree levels are the canonical mastery/badge system.

The app is not production-ready yet. The remaining blockers are concentrated and actionable rather than requiring a redesign.

---

## Canonical product model

### Primary daily loop

1. Read the daily message.
2. Check in by voice or manual emotion selection.
3. Confirm the feeling and contributing factors.
4. Receive one recommended practice.
5. Optionally open the matched Inner Path quest.
6. Complete the action and gain resonance or skill-tree progress.
7. Review trends in Insights.

### Canonical growth model

- **Resonance:** total meaningful practice and quest progress.
- **Mission stage:** the broad arc of development.
- **Skill-tree level:** mastery within a specific area.
- **Daily quest progress:** immediate action for today.
- **Activity rhythm:** consistency information, not a separate currency.
- **Lumen:** optional visual decoration only. It must never have its own points, levels, or badges.

### Mission stages

1. Stabilize the mind
2. Heal emotional suffering
3. Build positive habits
4. Discover purpose
5. Develop wisdom
6. Live in service

### Skill trees

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

---

## Changes completed on `chatgpt/coherence-audit`

### One app-wide Inner Path state

`SideProvider` now wraps the whole application rather than only the `/side` route group.

This allows:

- Today to show live resonance and quest progress.
- Insights to show skill-tree levels.
- Manual check-ins to match existing quests.
- Profile reset to clear Inner Path data consistently.

### Simplified Today dashboard

Today is now organized around four understandable sections:

1. Today’s word
2. Check in
3. Inner Path
4. Explore

The duplicate Lumen progression panel and explanatory daily-flow panel were removed. The Inner Path card now displays resonance, mission stage, active skill trees, and the next quest.

### Unified Insights growth display

Insights now displays:

- resonance
- current mission stage
- progress toward the next mission stage
- activity rhythm
- all 11 skill-tree levels
- emotion distribution
- factor associations
- voice baseline
- calmness trend
- check-in history

The separate Lumen points/levels/badges display was removed from this screen.

### Manual check-in parity

The manual emotion flow now reaches the same product concepts as voice check-in:

- recommended practice
- rationale
- wisdom card
- purpose-through-care prompt
- matched existing Inner Path quest

### Honest sign-in behavior

- Simulated Google identity is no longer shown when Google/Firebase is not configured.
- Local profile mode is the default fallback.
- Returning users with an existing baseline skip baseline capture after signing in again.
- Copy states that cloud sync is not enabled.

### Notification consent

Daily notifications now default to disabled. Permission is requested only when the user enables them.

### Consistent reset

Profile reset now clears both core app state and Inner Path state and explicitly lists the data categories being erased.

---

## P0 release blockers

These must be resolved before public release.

### 1. Voice analysis fabricates a fallback signal

`src/lib/voice.ts` currently generates synthetic meter samples when microphone meter data is insufficient. That can produce an emotion result from data the user never generated.

Required fix:

- Add a voice-sample quality check.
- Never synthesize replacement measurements.
- Return an explicit `unclear` result.
- Ask the user to retry or continue with manual emotion selection.
- Do not save an unclear sample as a baseline.
- Test microphone metering on representative iOS and Android devices.

### 2. Community screen simulates social activity

`app/side/community.tsx` contains seeded posts, simulated “people present,” synthetic collective totals, and seeded reactions.

Required fix before release:

- Hide the route, or convert it into an explicitly private local reflection board.
- Do not display simulated live participation or social proof.
- A real community requires accounts, moderation, reporting, blocking, privacy controls, abuse handling, and crisis-safety operations.

### 3. Sensitive data storage decision

Check-ins, screeners, journal text, and Inner Path reflections are stored in AsyncStorage.

Required decision:

- local-only with encrypted storage,
- encrypted local database,
- or optional secure sync.

Required release work:

- document the data inventory,
- encrypt sensitive content,
- define retention,
- verify export,
- verify deletion,
- publish privacy policy and terms.

### 4. Crisis and safety flow

The PHQ-9 sensitive item displays US 988 copy, but there is no dedicated crisis screen, localized resource handling, or tested emergency flow.

Required fix:

- dedicated safety route,
- clear immediate-danger action,
- country-appropriate resources,
- visible trusted-person action,
- tested PHQ-9 item 9 behavior,
- copy review by a qualified mental-health/safety reviewer.

### 5. Typecheck and release validation

The repository has `npm run lint` mapped to `tsc --noEmit`, but no CI workflow or automated test suite.

Required fix:

- run TypeScript locally,
- add CI typecheck,
- add unit tests for pure logic,
- run Expo release builds,
- test physical-device microphone and notifications.

### 6. Copyright and attribution audit

The daily message library includes attributed quotations and traditional sayings. Attribution accuracy and reuse rights need review.

Required fix:

- verify each quotation and attribution,
- replace questionable quotations with original paraphrases,
- avoid long copyrighted text,
- keep a content-review record.

---

## P1 coherence work

### Connect core practices to resonance

Breath, stillness, loving-kindness, and sound sessions currently update core session history but do not necessarily advance the corresponding Inner Path skill tree.

Required design:

- each completed practice maps to a repeatable canonical quest or a direct typed growth grant,
- reward once per qualifying session,
- explain the awarded resonance,
- prevent duplicate claims.

Suggested mapping:

- Breath → Mindfulness
- Stillness → Mindfulness + Wisdom
- Loving-kindness → Compassion + Relationships
- Sound → Mindfulness or Flow
- Sleep mixer → recovery tracking, not automatic spiritual progress

### Add matched quest to voice results

Manual check-ins now show a matched side quest. Voice results should use the same `sideQuestMatcher` path.

### Remove dead Lumen economy code

After confirming no remaining imports, remove or repurpose:

- `src/lib/progress.ts`
- `src/components/Companion.tsx`

If Lumen remains, it should visualize resonance/skill-tree state only.

### Finish local-first identity model

For a local-only launch:

- remove account language from onboarding,
- treat local profile as normal rather than anonymous,
- hide Google until backend sync exists.

For a synced launch:

- implement real Firebase auth,
- implement explicit sync consent,
- define what syncs,
- do not imply journal sync unless encrypted and intentionally designed.

### Spiritual and wisdom preferences

Wisdom paths are broad and optional, but preference controls are still needed.

Recommended settings:

- secular/science-forward
- philosophical
- contemplative/spiritual
- Christian contemplative
- Buddhist/mindfulness
- show all

### Content hierarchy

The app currently has:

- daily messages,
- recommendation wisdom cards,
- purpose prompts,
- side quests,
- wisdom paths,
- practices,
- guided reflection,
- journal prompts.

The rule should remain:

> Show one primary action. Keep supporting content expandable.

---

## Accessibility audit

### Already present

- button accessibility on `GradientButton`
- tab roles and selected state
- reduced-motion handling in some animated components
- haptic preference

### Required

- emotion-wheel nodes need labels and selected state,
- factor chips need checkbox state,
- practice duration/pattern pills need radio state,
- all icon-only controls need labels,
- test dynamic text sizing,
- test screen-reader order,
- test contrast,
- test 44-point touch targets,
- verify charts have textual summaries.

---

## Navigation and information architecture

### Main tabs

- **Today:** daily action hub
- **Insights:** trends, resonance, stages, and skill trees
- **Practices:** direct practice library
- **365:** daily content archive
- **You:** profile, preferences, data, and account actions

### Modal/deep routes

- voice check-in
- manual check-in
- baseline
- guided reflection
- journal
- sleep
- research/screeners
- individual practices
- Inner Path

This structure is coherent. Internal route filenames such as `voice.tsx` can remain technical implementation details while the displayed tab remains “Insights.”

---

## Technical architecture assessment

### Strengths

- Expo Router structure is understandable.
- Core state and Side state are typed.
- Storage is hidden behind adapters.
- Recommendation, wisdom, purpose, and quest matching are separated into pure modules.
- Side content is data-driven.
- Design tokens and reusable components are established.

### Risks

- `AppContext` and `SideContext` each perform storage writes inside state updates.
- Async write failures are mostly silent.
- There is no migration/version strategy for persisted data.
- There is no error telemetry.
- There is no schema validation for restored data.
- Content systems can diverge unless side quests remain the canonical action source.
- `supportsTablet: true` creates an iPad support and screenshot obligation without a verified tablet layout.

Recommended next technical modules:

- `storageVersion.ts` and migration functions
- encrypted storage adapter
- `practiceGrowth.ts` for practice-to-resonance mapping
- shared check-in result screen/component
- dedicated safety route
- CI workflow

---

## Production acceptance criteria

MoodSignal is ready for external beta when:

- [ ] TypeScript passes in CI.
- [ ] Voice low-quality samples produce retry, never fabricated analysis.
- [ ] Manual and voice check-ins use the same result model.
- [ ] Core practices visibly connect to resonance/skill trees.
- [ ] Simulated community activity is removed or hidden.
- [ ] Notification permission is explicitly opt-in and tested.
- [ ] Local data is encrypted or the privacy model is otherwise release-approved.
- [ ] Export and full deletion are tested.
- [ ] Crisis flow is reviewed and tested.
- [ ] Accessibility smoke test passes.
- [ ] iOS and Android release builds pass on physical devices.
- [ ] App Store copy avoids clinical and unsupported claims.
- [ ] Content attribution review is complete.

---

## Recommended implementation order

1. Run typecheck and fix all compile errors.
2. Implement voice-quality retry handling.
3. Remove simulated community behavior.
4. Connect completed practices to resonance and skill trees.
5. Add matched quest to voice results.
6. Add a shared result component to eliminate manual/voice duplication.
7. Complete accessibility pass on core flows.
8. Decide encrypted local vs optional sync architecture.
9. Add dedicated safety route and policy documents.
10. Build and test release candidates.
