# MoodSignal Roadmap

This roadmap is organized around bringing the current prototype into a production-grade app without losing the core vision.

---

## Phase 0 — Documentation and Source of Truth

Goal: make the project easy for humans and AI coding agents to continue safely.

- [x] Refresh README to reflect the whole app and production direction.
- [x] Add product vision doc.
- [x] Add production roadmap.
- [x] Add production checklist.
- [x] Add architecture notes.
- [x] Add content system notes.
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
- [ ] Add data export.
- [ ] Add delete-my-data flow.
- [ ] Add privacy policy and terms.

### Safety

- [ ] Improve PHQ-9 sensitive-item handling.
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

- [ ] Create `src/lib/recommendationEngine.ts`.
- [ ] Create a typed recommendation model.
- [ ] Combine voice affect, self-report, baseline shift, factors, time of day, and practice history.
- [ ] Return one primary recommendation plus one alternate.
- [ ] Track whether the user accepted, skipped, or completed the recommendation.
- [ ] Use completion history to avoid repeating the same practice too often.
- [ ] Add insight language that explains why the recommendation was selected.

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

Outputs:

- Practice route
- Duration
- Rationale
- Optional wisdom prompt
- Optional purpose action
- Safety escalation if needed

---

## Phase 3 — Wisdom and Purpose

Goal: add the app’s strongest differentiator: practical wisdom and stewardship.

### Wisdom Engine

- [ ] Create `src/data/wisdom.ts`.
- [ ] Tag wisdom entries by emotional state, virtue, practice type, and tradition.
- [ ] Create `src/lib/wisdomEngine.ts`.
- [ ] Add wisdom cards after check-ins.
- [ ] Add a wisdom library screen.
- [ ] Let users enable/disable categories: psychology, stoic, contemplative, Christian, Buddhist, Taoist, purpose, habits.

### Purpose Engine

- [ ] Create `src/lib/purposeEngine.ts`.
- [ ] Create purpose/stewardship prompts for different contexts.
- [ ] Add a purpose screen.
- [ ] Add “What needs care right now?” flow.
- [ ] Track completed acts of stewardship.
- [ ] Connect low-purpose states to small contribution actions.

### Flow / Mushin Module

- [ ] Add a no-mind / flow training concept page.
- [ ] Add practices for sport, music, coding, art, walking, and breath.
- [ ] Connect high-anxiety/high-self-consciousness states to flow practice.

---

## Phase 4 — Reflection and Insight

Goal: make the app learn from user behavior and show useful patterns.

- [ ] Add evening reflection flow.
- [ ] Add weekly review.
- [ ] Add trend cards for mood, stress, energy, calmness, practices, and factors.
- [ ] Add “what helps me” insight cards.
- [ ] Add “what drains me” insight cards.
- [ ] Add exportable reflection summary.
- [ ] Add streaks carefully, emphasizing consistency over compulsion.

---

## Phase 5 — Production Content Expansion

Goal: make the app feel rich without becoming noisy.

- [ ] Expand daily messages into tagged content sets.
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
