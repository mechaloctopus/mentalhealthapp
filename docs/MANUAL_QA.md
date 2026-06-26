# MoodSignal Manual QA Checklist

Use this checklist before merging a release candidate or shipping an external beta.

## Test devices

Minimum:

- Android physical device
- iPhone physical device

Recommended:

- small phone screen
- large phone screen
- tablet only if tablet support remains enabled

## Fresh install flow

- [ ] App launches without a blank screen.
- [ ] Splash hides correctly.
- [ ] Onboarding appears for a new install.
- [ ] Local profile sign-in works.
- [ ] Google sign-in is hidden unless real Google + Firebase config exists.
- [ ] First-run baseline route appears.
- [ ] User can complete baseline with a usable voice sample.
- [ ] User can skip or retry after a poor baseline sample.
- [ ] Tabs load after baseline or skip.

## Today dashboard

- [ ] Today’s word loads.
- [ ] Inner Path banner shows resonance and mission stage.
- [ ] Next quest appears when available.
- [ ] Check-in card opens voice check-in.
- [ ] Manual feeling option opens manual check-in.
- [ ] Practice tiles route correctly.
- [ ] Journal, reflection, sleep, and insights routes open.

## Voice check-in

- [ ] Microphone permission prompt appears.
- [ ] Denied permission routes to manual check-in.
- [ ] Recording starts and waveform responds.
- [ ] Finish is disabled before the minimum duration.
- [ ] Quiet/poor sample shows retry/manual path.
- [ ] Usable sample shows suggested emotion.
- [ ] User can correct emotion.
- [ ] Factor picker works.
- [ ] Result shows signal bars, practice, wisdom, purpose prompt, and matched quest.
- [ ] Starting the recommended practice works.
- [ ] Opening the matched quest works.

## Manual check-in

- [ ] Emotion wheel is usable by touch.
- [ ] Factor picker toggles correctly.
- [ ] Result shows the same content structure as voice check-in.
- [ ] Recommended practice opens.
- [ ] Matched quest opens.

## Practices and rewards

For each practice, complete a session longer than 20 seconds:

- [ ] Breath stores a session.
- [ ] Breath grants resonance once per day.
- [ ] Stillness stores a session.
- [ ] Stillness grants resonance once per day.
- [ ] Loving-kindness stores a session.
- [ ] Loving-kindness grants resonance once per day.
- [ ] Sound stores a session.
- [ ] Sound grants resonance once per day.
- [ ] Repeating the same practice the same day stores the session but does not double-award resonance.
- [ ] Sound stop unloads audio.
- [ ] Changing Sound preset while playing stops/accounts for the current session.

## Inner Path

- [ ] Side dashboard opens from Today and Profile.
- [ ] Daily quests display.
- [ ] Quest completion grants resonance once when intended.
- [ ] Non-repeatable quests cannot be completed repeatedly.
- [ ] Repeatable daily quests cannot be completed twice in the same day.
- [ ] Skill-tree levels update after rewards.
- [ ] Wisdom paths open.
- [ ] Mentor screen opens.
- [ ] Private compassion wall stores local notes.

## Insights

- [ ] Resonance and mission progress display.
- [ ] Skill-tree badges display.
- [ ] Emotion distribution displays after check-ins.
- [ ] Factor associations display only when there is data.
- [ ] Baseline bars display when a baseline exists.
- [ ] Calmness trend displays when enough check-ins exist.
- [ ] History displays latest check-ins.

## Notifications

- [ ] Notifications default off.
- [ ] Enabling notifications requests permission.
- [ ] Delivery time can be changed.
- [ ] Pending count updates.
- [ ] Preview notification sends.
- [ ] Notification opens the correct daily message.
- [ ] Disabling notifications cancels daily-message notifications.
- [ ] Reset cancels daily-message notifications.
- [ ] Scoped cancellation does not remove unrelated future app notifications.

## Journal and reflection

- [ ] Journal list opens.
- [ ] New journal entry saves.
- [ ] Journal deletion works.
- [ ] Guided reflection saves to journal/history as intended.
- [ ] Export includes journal entries.
- [ ] Reset removes journal entries.

## Screeners and export

- [ ] PHQ-9 can be completed.
- [ ] GAD-7 can be completed.
- [ ] Scores and severity labels save.
- [ ] History displays prior results.
- [ ] Export opens the share sheet.
- [ ] Export JSON includes core app state and Inner Path state.
- [ ] Reset clears exported categories from local state.

## Accessibility smoke test

- [ ] Screen reader reads main buttons in a logical order.
- [ ] Emotion wheel choices have labels and selected states.
- [ ] Factor choices have labels and checked states.
- [ ] Breath duration and pattern choices have selected states.
- [ ] Sound presets have selected states.
- [ ] Icon-only buttons have labels.
- [ ] Dynamic text does not make primary flows unusable.
- [ ] Reduced-motion setting does not make screens unusable.
- [ ] Color is not the only indicator for critical meaning.

## Offline and recovery

- [ ] App opens offline.
- [ ] Existing local data loads offline.
- [ ] Local profile works offline.
- [ ] Practices work offline.
- [ ] Daily message archive works offline.
- [ ] Export works offline.
- [ ] App recovers from force close during recording.
- [ ] App recovers from force close during sound playback.
- [ ] App recovers from force close during reset.

## Release build checks

- [ ] `npm ci` completes.
- [ ] `npm run lint` completes.
- [ ] Android build installs and launches.
- [ ] iOS build installs and launches.
- [ ] Microphone works in release build.
- [ ] Notifications work in release build.
- [ ] Sound playback works in release build.
- [ ] App icon, splash, package name, and version are correct.
