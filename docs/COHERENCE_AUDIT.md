# MoodSignal Production Coherence Audit

This audit reviews MoodSignal as one product rather than a collection of screens.

## Executive assessment

MoodSignal has a strong visual identity and a substantial prototype. Its canonical loop is now:

```text
Check in → Understand the signal → Receive one next step → Practice or complete a quest → Gain resonance → Grow skill trees
```

The largest product inconsistency was competing growth systems. The core app previously displayed separate Lumen points, levels, and badges while the Inner Path used resonance, mission stages, and skill trees.

The product model is now:

- **Resonance** is the only growth currency.
- **Mission stage** represents the broad developmental arc.
- **Skill-tree level** represents mastery in a specific area.
- **Daily quest progress** represents today’s action.
- **Activity rhythm** represents consistency but is not a currency.
- **Lumen**, if retained later, is visual decoration that reflects resonance and skill trees. It does not have a separate economy.

The app is not production-ready yet, but the remaining blockers are concentrated and do not require another redesign.

---

## Canonical daily experience

1. Read Today’s Word.
2. Check in by voice or manual emotion selection.
3. Confirm the feeling and contributing factors.
4. Receive one recommended practice.
5. Optionally open a matched Inner Path quest.
6. Complete the practice or quest.
7. Gain resonance and skill-tree progress.
8. Review patterns in Insights.

## Canonical navigation

- **Today:** daily action hub
- **Insights:** trends, resonance, stages, and skill trees
- **Practices:** direct practice library
- **365:** daily message archive
- **You:** profile, notification preferences, data, and account actions
- **Inner Path:** quests, mission stages, wisdom paths, skill trees, mentor, and private compassion practice

---

## Completed on `chatgpt/coherence-audit`

### App-wide Inner Path state

`SideProvider` now wraps the complete application rather than only `/side`.

This allows Today, Insights, manual check-in, profile reset, and future practice rewards to share one canonical state.

### Simplified Today

Today now has four sections:

1. Today’s Word
2. Check in
3. Inner Path
4. Explore

The duplicate Lumen progression card and explanatory daily-flow panel were removed. The Inner Path card displays resonance, mission stage, active skill trees, daily quest progress, and the next quest.

### Unified Insights growth display

Insights now displays:

- resonance
- mission stage and progress to the next stage
- activity rhythm
- all 11 skill-tree levels
- emotion distribution
- factor associations
- voice baseline
- calmness trend
- check-in history

The separate Lumen points/levels/badges display was removed.

### Manual check-in parity

Manual emotion selection now produces:

- one recommended practice
- rationale
- wisdom card
- purpose-through-care prompt
- matched existing Inner Path quest

### Honest account behavior

- Simulated Google identity is hidden when Firebase/Google is not configured.
- Local profile mode is the normal fallback.
- Returning users with a stored baseline skip baseline capture.
- Copy states that cloud sync is not enabled.

### Explicit notification consent

Daily notifications now default to disabled. Permission is requested only after the user enables notifications.

### Consistent reset

Profile reset clears both core app state and Inner Path state and accurately lists the erased data categories.

### Honest community scope

The former simulated community was converted into a private local compassion surface.

Removed:

- fake live-user counts
- seeded anonymous posts presented as activity
- synthetic collective progress
- fake reactions

The current screen explicitly states that notes remain local and private.

### Safer practice copy

The unguided monthly fasting suggestion was removed. Practice copy now emphasizes direct exercises, stable nourishment, sleep environment, and low-risk supportive habits.

### Core accessibility improvements

- Emotion-wheel nodes now expose radio labels and selected state.
- Factor chips now expose checkbox labels and checked state.
- Practice cards expose descriptive button labels.
- Existing tab and primary-button accessibility remains intact.

---

## P0 release blockers

### 1. Voice low-quality handling

`src/lib/voice.ts` currently creates synthetic meter samples when microphone data is insufficient. This can produce a result that is not based on the user’s recording.

Required fix:

- validate sample duration, meter count, and audible samples,
- never synthesize replacement measurements,
- return an explicit unclear result,
- ask the user to retry or continue manually,
- never save an unclear recording as a baseline,
- test real microphone metering on iOS and Android devices.

### 2. Sensitive data storage

Check-ins, screeners, journals, quest reflections, and private compassion notes are stored in AsyncStorage.

Required release decision:

- encrypted local-only storage,
- encrypted local database,
- or explicit optional secure sync.

Required work:

- data inventory,
- encryption,
- storage migration/versioning,
- retention policy,
- tested export,
- tested complete deletion,
- privacy policy,
- terms.

### 3. Crisis and safety flow

The PHQ-9 sensitive item displays US 988 copy, but the app lacks a dedicated safety route and localized resource handling.

Required fix:

- dedicated safety screen,
- immediate-danger action,
- country-appropriate resources,
- trusted-person action,
- tested PHQ-9 item 9 behavior,
- qualified review of safety copy.

### 4. Typecheck, tests, and release validation

The repository has `npm run lint` mapped to `tsc --noEmit`, but no CI workflow or automated test suite.

Required fix:

- run TypeScript locally,
- add CI typecheck,
- add unit tests for pure modules,
- create iOS and Android release builds,
- test microphone, notifications, storage, reset, export, and quest completion on devices.

### 5. Copyright and attribution review

The daily message library contains attributed quotations and traditional sayings.

Required fix:

- verify wording and attribution,
- replace uncertain quotations with original paraphrases,
- avoid long copyrighted excerpts,
- keep a content-review record.

---

## P1 coherence work

### Connect core practices to resonance

Core practice sessions currently update session history but do not consistently advance the Inner Path.

Recommended mapping:

- Breath → Mindfulness
- Stillness → Mindfulness + Wisdom
- Loving-kindness → Compassion + Relationships
- Sound → Mindfulness or Flow
- Sleep mixer → recovery history, not automatic spiritual progress

Create a typed `practiceGrowth.ts` adapter that:

- rewards qualifying completed sessions once,
- uses canonical quests or typed grants,
- explains the reward,
- prevents double claims.

### Add matched quest to voice results

Manual check-ins now show a matched quest. Voice results should call the same `sideQuestMatcher`.

### Share the check-in result UI

Voice and manual flows now use similar data but duplicate presentation logic. Extract a shared result component so both flows cannot drift.

### Remove dead Lumen economy files

After a local import check, remove or repurpose:

- `src/lib/progress.ts`
- `src/components/Companion.tsx`

They should not remain as an unused second progression model.

### Finish the identity strategy

For local-only launch:

- treat local profile as the normal mode,
- remove unnecessary account language,
- hide Google until secure sync exists.

For a synced launch:

- implement real auth,
- request explicit sync consent,
- define exactly what syncs,
- avoid syncing sensitive freeform text without an intentional encrypted design.

### Add wisdom preferences

Recommended preference options:

- secular/science-forward
- philosophical
- contemplative/spiritual
- Christian contemplative
- Buddhist/mindfulness
- show all

---

## Technical assessment

### Strengths

- understandable Expo Router structure
- typed core and Inner Path state
- storage behind adapters
- pure recommendation, purpose, wisdom, and quest-matching modules
- data-driven side quests and wisdom paths
- established design system

### Risks

- storage writes occur inside state updates,
- write failures are mostly silent,
- restored data has no runtime schema validation,
- no persisted-data migration strategy,
- no error telemetry,
- `supportsTablet: true` creates an unverified iPad layout and screenshot obligation,
- content systems can diverge unless side quests remain the canonical action source.

Recommended technical additions:

- storage version and migration functions
- encrypted storage adapter
- `practiceGrowth.ts`
- shared check-in result component
- dedicated safety route
- CI workflow

---

## Remaining accessibility work

- practice pattern and duration pills need radio state,
- icon-only controls need a full label audit,
- charts need textual summaries,
- test dynamic text sizing,
- test screen-reader order,
- test contrast,
- verify minimum touch targets,
- complete VoiceOver and TalkBack smoke tests.

---

## External beta acceptance criteria

- [ ] TypeScript passes in CI.
- [ ] Low-quality voice samples produce retry, never fabricated analysis.
- [x] Manual and voice check-ins use the same recommendation model.
- [ ] Voice results display a matched Inner Path quest.
- [ ] Core practices visibly connect to resonance and skill trees.
- [x] Simulated community activity is removed.
- [x] Notification permission is opt-in.
- [ ] Local sensitive data is encrypted or otherwise release-approved.
- [ ] Export and full deletion are tested.
- [ ] Crisis flow is reviewed and tested.
- [ ] Accessibility smoke test passes.
- [ ] iOS and Android release builds pass on physical devices.
- [ ] App Store copy avoids unsupported claims.
- [ ] Content attribution review is complete.

## Recommended implementation order

1. Run typecheck and fix compile errors.
2. Implement voice-quality retry handling.
3. Connect completed practices to resonance and skill trees.
4. Add matched quest to voice results.
5. Extract a shared check-in result component.
6. Remove dead Lumen progression files after import verification.
7. Complete core accessibility work.
8. Decide encrypted local vs optional sync architecture.
9. Add dedicated safety route and policy documents.
10. Build and test release candidates.
