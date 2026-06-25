# MoodSignal Production Checklist

This checklist defines what should be true before MoodSignal is treated as production-ready.

---

## Product Definition

- [ ] Product positioning is final: wellness/reflection/practice, not diagnosis.
- [ ] Core loop is clear: Signal → Awareness → Wisdom → Practice → Purpose → Growth.
- [ ] App has a clear first-session experience.
- [ ] App has a clear daily-use experience.
- [ ] App has a clear recovery path when users feel distressed.
- [ ] App avoids overwhelming users with too many choices.

---

## Safety and Mental Health Language

- [ ] All copy avoids diagnostic claims.
- [ ] Voice analysis is described as approximate and reflective.
- [ ] PHQ-9/GAD-7 are described as self-report screeners, not diagnoses.
- [ ] PHQ-9 item 9 produces clear care-oriented messaging.
- [ ] Crisis-resource screen exists.
- [ ] Emergency copy is direct and accessible.
- [ ] App Store description does not overclaim clinical benefit.
- [ ] Disclaimers appear in onboarding, profile/about, and relevant screener flows.

---

## Privacy and Data Handling

- [ ] Sensitive data inventory is complete.
- [ ] Local data storage approach is documented.
- [ ] If data syncs, backend privacy/security rules are documented.
- [ ] If journals are stored, encryption decision is documented.
- [ ] Users can delete local data.
- [ ] Users can export data if feasible.
- [ ] Privacy policy exists.
- [ ] Terms of service exists.
- [ ] App Store privacy labels are prepared.

---

## Authentication

- [ ] Dummy auth removed or clearly disabled in production.
- [ ] Real Google sign-in implemented.
- [ ] Anonymous mode works.
- [ ] Anonymous accounts can upgrade.
- [ ] Sign-out works.
- [ ] Account deletion or local reset is clear.
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
- [ ] Denied permission flow is clear.
- [ ] Recording can be stopped safely.
- [ ] Very short/empty recordings are handled.
- [ ] Background/interruption behavior tested.
- [ ] App explains voice interpretation limitations.
- [ ] User can correct the suggested emotion.
- [ ] Audio file handling is documented.
- [ ] No raw audio is persisted unless explicitly designed and disclosed.

---

## Notifications

- [ ] Notification permission flow tested.
- [ ] Daily message scheduling tested.
- [ ] iOS pending notification cap respected.
- [ ] Android notification channel tested.
- [ ] Deep links from notifications tested.
- [ ] User can change notification time.
- [ ] User can disable notifications.
- [ ] Notification copy is safe and non-alarming.

---

## Practices

- [ ] Breath practice works end-to-end.
- [ ] Stillness/body scan works end-to-end.
- [ ] Loving-kindness works end-to-end.
- [ ] Sound practice works end-to-end.
- [ ] Practice completion is tracked.
- [ ] Practice durations are clear.
- [ ] Practice exits are clear.
- [ ] Audio behavior tested on device.

---

## Screeners

- [ ] PHQ-9 scoring verified.
- [ ] GAD-7 scoring verified.
- [ ] Severity bands verified.
- [ ] Sensitive item flagging verified.
- [ ] Screener history display is clear.
- [ ] Screeners are optional.
- [ ] Screeners include appropriate disclaimers.

---

## Recommendation Engine

- [ ] Recommendation model is typed.
- [ ] Recommendations consider self-report when present.
- [ ] Recommendations consider baseline shift.
- [ ] Recommendations consider recent practice history.
- [ ] Recommendations avoid repeating the same suggestion too often.
- [ ] Recommendations include a short rationale.
- [ ] Recommendations can route to practice, journal, wisdom, or purpose.

---

## Content System

- [ ] Daily message content is reviewed.
- [ ] Content has tags.
- [ ] Content categories are documented.
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
- [ ] Haptic preference is respected.
- [ ] Color is not the only signal of meaning.

---

## Testing

- [ ] TypeScript check passes.
- [ ] Unit tests added for core pure functions.
- [ ] Manual QA checklist completed.
- [ ] Real-device microphone test completed.
- [ ] Real-device notification test completed.
- [ ] Navigation smoke test completed.
- [ ] Release build smoke test completed.

Recommended test targets:

- `src/lib/voice.ts`
- `src/lib/screeners.ts`
- `src/lib/notifications.ts`
- `src/lib/recommendationEngine.ts`
- `src/lib/wisdomEngine.ts`
- `src/lib/purposeEngine.ts`
- `src/lib/storage.ts`

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
