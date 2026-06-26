# MoodSignal Production Checklist

This checklist defines what should be true before MoodSignal is treated as production-ready.

---

## Product Definition

- [ ] Product positioning is final: wellness/reflection/practice, not diagnosis.
- [x] Core loop is documented: Signal → Awareness → Wisdom → Practice → Purpose → Growth → Resonance.
- [x] App has a clear first-session route gate: onboarding → sign-in → baseline → tabs.
- [x] App has a clear daily-use dashboard.
- [x] App has a clear recovery path when users feel distressed (`app/crisis.tsx`, reachable from Profile, screener results, and the dashboard's safety surfacing).
- [ ] App avoids overwhelming users with too many choices.

---

## Safety and Mental Health Language

- [ ] All copy avoids diagnostic claims.
- [x] Voice analysis is described as approximate and reflective in core docs.
- [x] PHQ-9/GAD-7 are described as self-report screeners, not diagnoses.
- [x] PHQ-9 item 9 produces centralized care-oriented messaging.
- [x] Crisis-resource screen exists (`app/crisis.tsx`: 988 call/text, Crisis Text Line, 911, findahelpline.com for outside the US).
- [x] Emergency copy is direct, accessible, and localized where possible (US-specific 988/911; "Outside the US" card links to findahelpline.com).
- [ ] App Store description does not overclaim clinical benefit.
- [x] Disclaimers appear in onboarding (`app/onboarding.tsx` final slide), profile/about (Privacy policy + Terms links in Profile), and screener flows (`app/research.tsx`).

---

## Privacy and Data Handling

- [ ] Sensitive data inventory is complete.
- [ ] Local data storage approach is documented.
- [ ] If data syncs, backend privacy/security rules are documented.
- [ ] If journals are stored, encryption decision is documented.
- [x] Users can export data through Research & data.
- [x] Users can reset local app data.
- [ ] Users can delete account/backend data if backend is enabled.
- [x] Privacy policy exists (`docs/PRIVACY_POLICY.md` + in-app `app/privacy-policy.tsx`; still needs a public hosted URL and lawyer review before App Store submission).
- [x] Terms of service exists (`docs/TERMS_OF_SERVICE.md` + in-app `app/terms.tsx`; same hosting/review caveat).
- [ ] App Store privacy labels are prepared.

---

## Authentication

- [ ] Dummy auth removed or clearly disabled in production.
- [ ] Real Google sign-in implemented.
- [x] Anonymous mode exists in the demo auth layer.
- [ ] Anonymous accounts can upgrade.
- [x] Sign-out flow exists.
- [x] Local reset flow exists.
- [ ] Auth failures are handled gracefully.

---

## Core App Reliability

- [ ] App starts reliably from fresh install.
- [ ] App starts reliably after force close.
- [ ] App starts reliably offline.
- [ ] App handles corrupted local storage.
- [ ] Navigation has no dead ends.
- [ ] All major screens have empty states.
- [ ] All major async actions have loading/error states.
- [ ] Release build tested on iOS.
- [ ] Release build tested on Android.

---

## Voice Check-In

- [ ] Microphone permission request copy is clear.
- [x] Denied permission flow exists.
- [x] Recording can be stopped safely.
- [x] Very short recordings are blocked by the UI minimum duration.
- [ ] Empty/metering-failure recordings are manually tested.
- [ ] Background/interruption behavior tested.
- [ ] App explains voice interpretation limitations in-flow.
- [x] User can correct the suggested emotion.
- [ ] Audio file handling is documented.
- [ ] No raw audio is persisted unless explicitly designed and disclosed.

---

## Notifications

- [ ] Notification permission flow tested.
- [ ] Daily message scheduling tested.
- [x] iOS pending notification cap is addressed through a rolling window.
- [x] Android notification channel exists.
- [ ] Deep links from notifications tested.
- [x] User can change notification time.
- [x] User can disable notifications.
- [ ] Notification copy is safe and non-alarming.

---

## Practices

- [ ] Breath practice works end-to-end on device.
- [ ] Stillness/body scan works end-to-end on device.
- [ ] Loving-kindness works end-to-end on device.
- [ ] Sound practice works end-to-end on device.
- [x] Practice completion is tracked in app state.
- [ ] Core practice completion is connected to side-module resonance where appropriate.
- [ ] Practice durations are clear.
- [ ] Practice exits are clear.
- [ ] Audio behavior tested on device.

---

## Side Module / Inner Path

- [x] Side stack exists under `app/side/`.
- [x] `SideProvider` persists `sideState`.
- [x] Resonance exists.
- [x] Karma, stewardship, and flow counters exist.
- [x] Daily quest generation exists.
- [x] Quest completion and reflection capture exist.
- [x] Mission stages exist.
- [x] Wisdom paths exist.
- [x] Skill trees exist.
- [x] Mentor nudges exist.
- [x] Community/gathering surface exists.
- [x] Main Today dashboard has an Inner Path entry banner.
- [ ] Main Today dashboard shows compact live side-module progress.
- [ ] Recommendation engine can recommend specific side quests.
- [ ] Side module has onboarding/explainer copy.
- [ ] Side module has anti-compulsion copy.
- [ ] Side module state is included in reset/export behavior consistently.

---

## Screeners

- [x] PHQ-9 scoring verified (`src/lib/screeners.test.ts`).
- [x] GAD-7 scoring verified (`src/lib/screeners.test.ts`).
- [x] Severity bands verified (`src/lib/screeners.test.ts`).
- [x] Sensitive item flagging verified (`src/lib/screeners.test.ts`, `src/lib/safety.test.ts`).
- [x] Screener history display exists.
- [x] Screeners are optional.
- [x] Screeners include reflection/not-diagnosis disclaimers.

---

## Recommendation Engine

- [x] Recommendation model is typed.
- [x] Recommendations consider self-report through finalized check-in emotion.
- [x] Recommendations consider baseline shift.
- [x] Recommendations consider recent practice history.
- [x] Recommendations avoid repeating the same recent practice route in a basic way.
- [x] Recommendations include a short rationale.
- [x] Recommendations attach wisdom and purpose content.
- [ ] Recommendations can route to a specific side quest.
- [ ] Recommendations can route to journal when appropriate.
- [ ] Recommendation acceptance/skips/completions are tracked.

---

## Content System

- [ ] Daily message content is reviewed.
- [x] Side quest/path content is typed and data-driven.
- [x] Wisdom card content is typed and tagged.
- [ ] All content categories are documented against live source files.
- [ ] Spiritual/wisdom content is optional and configurable.
- [ ] No copyrighted long excerpts are included without permission.
- [ ] Content avoids clinical promises.
- [ ] Content has a review process before release.

---

## Accessibility

- [ ] VoiceOver/TalkBack labels exist for interactive elements.
- [ ] Buttons have adequate touch targets.
- [ ] Dynamic type is tested.
- [ ] Contrast is tested.
- [ ] Reduced motion mode is supported or animations remain gentle.
- [x] Haptic preference exists.
- [ ] Haptic preference is respected everywhere.
- [ ] Color is not the only signal of meaning.

---

## Testing

- [x] TypeScript check passes (`npm run lint`, part of `npm run check`).
- [x] Unit tests added for core pure functions — `src/lib/screeners.ts`, `src/lib/safety.ts`, `src/lib/voice.ts`, `src/lib/recommendationEngine.ts` (27 tests, `npm run test`, run via `node:test` + `tsx`, part of `npm run check`). The targets below not yet covered remain open.
- [ ] Manual QA checklist completed.
- [ ] Real-device microphone test completed.
- [ ] Real-device notification test completed.
- [ ] Navigation smoke test completed.
- [ ] Release build smoke test completed.

Recommended test targets still open:

- `src/lib/notifications.ts`
- `src/lib/purposeEngine.ts`
- `src/lib/storage.ts`
- `src/side/SideContext.tsx`
- `src/side/content.ts`
- `src/side/trees.ts`
- future `src/lib/sideQuestMatcher.ts`

---

## Cleanup and Maintainability

- [x] Remove stale `notificationsScheduled` storage key.
- [ ] Confirm no unused route files exist.
- [ ] Confirm no duplicate wisdom/purpose systems diverge from side content.
- [ ] Confirm all docs name only real files or clearly mark future modules.
- [ ] Add automated lint/typecheck in CI.

---

## App Store Launch

- [ ] App name final.
- [ ] Bundle/package IDs final.
- [ ] Icon final.
- [ ] Splash final.
- [ ] iPhone screenshots complete.
- [ ] iPad screenshots complete if tablet support remains enabled.
- [ ] App Store description complete.
- [ ] Keywords complete.
- [ ] Support URL ready.
- [ ] Privacy policy URL ready.
- [ ] Terms URL ready.
- [ ] TestFlight feedback reviewed.
- [ ] Release candidate tagged.
