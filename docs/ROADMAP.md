# MoodSignal Roadmap

This roadmap is organized around bringing the current prototype into a production-grade app without losing the core vision.

---

## Phase 0 — Documentation and Source of Truth

Goal: make the project easy for humans and AI coding agents to continue safely.

- [x] Refresh README to reflect the whole app and production direction.
- [x] Add product vision doc.
- [x] Add side module / Inner Path doc.
- [x] Add production roadmap.
- [x] Add production checklist.
- [x] Add architecture notes.
- [x] Add content system notes.
- [x] Add repo audit doc.
- [ ] Add screenshots or screen recordings to README.
- [ ] Add a short contributor/developer guide.
- [ ] Add issue templates for features, bugs, and content changes.

---

## Phase 1 — Production Foundation

Goal: make the app stable, safe, and shippable.

### Auth and Identity

- [ ] Replace dummy Google sign-in with real auth.
- [ ] Support anonymous mode with later account upgrade.
- [ ] Add sign-out and account reset flows that are clear and safe.
- [ ] Decide whether user profile data syncs to backend.

### Storage and Privacy

- [ ] Decide production data model: local-only, encrypted local, backend sync, or hybrid.
- [ ] Encrypt sensitive local data if keeping journals/check-ins on device.
- [x] Add data export surface.
- [ ] Add delete-my-data flow.
- [ ] Add privacy policy and terms.

### Safety

- [x] Centralize basic screener safety copy.
- [ ] Add a dedicated crisis support screen.
- [ ] Add careful copy review for all mental-health-adjacent claims.
- [ ] Ensure every diagnostic-adjacent feature is framed as reflection, not diagnosis.

### Reliability

- [ ] Add crash reporting.
- [ ] Add structured error logging.
- [ ] Add analytics for product usage without collecting private journal contents.
- [ ] Add offline and failed-storage recovery states.
- [ ] Test release builds on iOS and Android.

### Accessibility

- [ ] VoiceOver/TalkBack pass.
- [ ] Dynamic font size pass.
- [ ] Reduced motion mode.
- [ ] Contrast review.
- [ ] Haptics preference respected everywhere.

---

## Phase 2 — Recommendation Engine

Goal: move from static practice matching to a coherent state-to-action engine.

- [x] Create `src/lib/recommendationEngine.ts`.
- [x] Create a typed recommendation model.
- [x] Combine emotion, stress, energy, calmness, stability, baseline shift, and recent practice history.
- [x] Return one primary recommendation plus one alternate.
- [x] Add insight language explaining why the recommendation was selected.
- [x] Attach wisdom and purpose prompts to the recommendation.
- [x] Create `src/lib/sideQuestMatcher.ts` to map state to existing side quests.
- [ ] Wire side-quest matches into the check-in result UI once side state is readable outside `app/side`.
- [ ] Track whether the user accepted, skipped, or completed the recommendation.
- [ ] Use check-in history and factors more deeply.
- [ ] Add tests for recommendation selection and side-quest matching.

Inputs:

- Emotion
- Stress level
- Energy
- Calmness
- Stability
- Baseline shift
- User-selected factors
- Time of day
- Recent check-ins
- Recent sessions
- Preferences
- Side-module progress

Outputs:

- Practice route
- Duration
- Rationale
- Wisdom prompt
- Purpose action
- Optional side quest
- Safety escalation if needed

---

## Phase 3 — Wisdom, Purpose, and Side Module Integration

Goal: make the app’s differentiator visible: practical wisdom, stewardship, and sacred gamification.

### Wisdom Engine

- [x] Create `src/data/wisdom.ts`.
- [x] Tag wisdom entries by emotional state, virtue, practice type, and tradition.
- [x] Add wisdom cards after check-ins.
- [ ] Create a dedicated `src/lib/wisdomEngine.ts` if selection needs outgrow `data/wisdom.ts` helpers.
- [ ] Add a wisdom library screen or connect to the existing side Wisdom Library path.
- [ ] Let users enable/disable categories: psychology, stoic, contemplative, Christian, Buddhist, Taoist, purpose, habits.

### Purpose Engine

- [x] Create `src/lib/purposeEngine.ts`.
- [x] Create purpose/stewardship prompts for different contexts.
- [x] Add purpose/stewardship cards after check-ins.
- [x] Add a side-quest matcher that can connect purpose-like states to existing side-module quests.
- [ ] Wire purpose prompts to existing side-module Acts of Stewardship quests in UI.
- [ ] Add direct “What needs care right now?” flow or route.
- [ ] Track completed acts of stewardship in side-module state.

### Side Module / Inner Path

Already implemented:

- [x] Side stack navigation under `app/side/`.
- [x] `SideProvider` and `sideState` persistence.
- [x] Resonance, karma, stewardship, and flow counters.
- [x] Daily quest generation.
- [x] Quest completion and reflection history.
- [x] Wisdom paths and path progress.
- [x] Skill trees and tree leveling.
- [x] Mentor nudges.
- [x] Community/gathering surface.

Needed integration:

- [ ] Add a compact side-module panel to the main Today dashboard.
- [ ] Connect core practice completions to side-module resonance where appropriate.
- [ ] Wire `src/lib/sideQuestMatcher.ts` into recommendation surfaces.
- [ ] Add side-module onboarding explaining resonance, daily quests, paths, and skill trees.
- [ ] Add tests for daily quest generation, quest completion, path progress, and tree leveling.
- [ ] Add anti-compulsion copy: resonance reflects practice, not worth.

### Flow / Mushin Module

- [x] Flow exists as a side skill tree.
- [x] Flow/Mushin appears in side content and wisdom scaffolding.
- [x] Side-quest matcher can prefer flow quests for anxious, excited, or frustrated states.
- [ ] Make high-anxiety/high-self-consciousness recommendations surface a specific flow quest in UI.
- [ ] Add more practices for sport, music, coding, art, walking, and breath.

---

## Phase 3b — Cosmic Rim Module

Goal: a separate, non-gamified planetary energy and position guide. Full detail in
`docs/COSMIC_RIM.md`.

- [x] Real astronomical computation layer (`src/lib/astronomy.ts`, astronomy-engine).
- [x] 7-planet positions on a live zodiac wheel (`src/components/ZodiacWheel.tsx`).
- [x] Moon phase glyph and dashboard widget (`src/components/MoonPhaseGlyph.tsx`).
- [x] Dominant-planet-of-the-day callout.
- [x] Chaldean day/hour ruler guide (`app/cosmic/hours.tsx`).
- [x] Moon watcher guide with full 8-phase folk meanings (`app/cosmic/moon.tsx`).
- [x] Per-planet myth/Agrippa-correspondence/archangel detail screens.
- [x] Birth echo: local-only birth chart overlay on today's positions (`app/cosmic/birth.tsx`).
- [x] Wired into navigation and dashboard (`app/_layout.tsx`, `app/(tabs)/index.tsx`).
- [ ] Location-aware sunrise/sunset for accurate planetary hours and a real Ascendant.
- [ ] House system once location input exists.
- [ ] Sumerian/Babylonian constellation lore beyond the zodiac.
- [ ] AR "pocket Stellarium" mode (space-only, accurate real-time planet positions; no Earth horizon).

---

## Phase 4 — Main Dashboard and Insight

Goal: make the app feel unified.

- [ ] Add main Today dashboard panel for:
  - current resonance
  - mission stage
  - daily quest progress
  - recommended side quest
  - top skill tree progress
- [ ] Add evening reflection flow.
- [ ] Add weekly review.
- [ ] Add trend cards for mood, stress, energy, calmness, practices, factors, and side-module progress.
- [ ] Add “what helps me” insight cards.
- [ ] Add “what drains me” insight cards.
- [ ] Add exportable reflection summary.
- [ ] Add streaks carefully, emphasizing consistency over compulsion.

---

## Phase 5 — Production Content Expansion

Goal: make the app feel rich without becoming noisy.

- [ ] Expand daily messages into tagged content sets.
- [ ] Expand `src/data/wisdom.ts`.
- [ ] Expand side-module wisdom paths and quests.
- [ ] Add more journal prompts.
- [ ] Add sleep wind-down content.
- [ ] Add gratitude, forgiveness, courage, and compassion practices.
- [ ] Add purpose actions.
- [ ] Add wisdom-to-action cards.
- [ ] Add content review workflow.

---

## Phase 6 — Backend and Sync

Goal: support accounts, backup, and optional personalization.

- [ ] Decide Firebase vs Supabase vs local-only for launch.
- [ ] Implement secure auth.
- [ ] Implement user settings sync.
- [ ] Implement optional encrypted backup.
- [ ] Add server-side content updates if needed.
- [ ] Avoid syncing sensitive freeform journal text unless privacy design is explicit.

---

## Phase 7 — App Store Launch

Goal: ship a compliant public app.

- [ ] App icon and splash final pass.
- [ ] Screenshots for required iPhone and iPad sizes.
- [ ] App Store description.
- [ ] Keywords.
- [ ] Privacy nutrition labels.
- [ ] Terms and privacy URLs.
- [ ] TestFlight internal testing.
- [ ] TestFlight external testing.
- [ ] Release candidate checklist.

---

## Backlog Ideas

- Wearable integration
- AI coach with strict safety boundaries
- Local LLM journaling analysis
- Community circles
- Mentor/accountability mode
- Therapist dashboard only if clinically reviewed
- Audio journeys
- Breath-to-sound biofeedback
- Nature/location-based insight tagging
- Calendar-aware check-ins
- Mood-to-music recommendation
