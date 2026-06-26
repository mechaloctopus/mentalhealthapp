# MoodSignal

**MoodSignal is a local-first emotional check-in, practice, wisdom, and personal-growth app built with React Native, Expo, and TypeScript.**

Its canonical loop is:

> **Daily word → Check in → One wise next step → Practice or quest → Resonance → Skill-tree growth → Insight**

MoodSignal is a wellness and self-reflection companion. It is not a medical device, does not diagnose or treat any condition, and should not replace qualified professional care.

---

## What the app currently does

- **Voice check-ins** — records a short reflection and estimates energy, calmness, stability, stress, and an approximate emotional signal from microphone metering.
- **Manual check-ins** — lets the user name a feeling directly through the emotion wheel.
- **User confirmation** — the user’s own selected emotion is treated as the final answer.
- **Sample-quality protection** — unusable voice samples produce retry/manual options; the app does not synthesize replacement data.
- **Recommendation engine** — returns one primary practice, rationale, wisdom card, purpose-through-care prompt, and matched Inner Path quest.
- **Practices** — breath, stillness/body scan, loving-kindness, sound, and sleep soundscapes.
- **Inner Path** — resonance, mission stages, daily quests, wisdom paths, mentor nudges, karma, stewardship, flow, and 11 skill trees.
- **Practice rewards** — core practices visibly grant resonance and skill-tree growth once per day.
- **Insights** — emotion distribution, contributing-factor associations, calmness trends, baseline comparison, resonance, mission progress, and skill-tree levels.
- **365 messages** — daily affirmations, reflections, quotations, devotionals, grounding prompts, and resilience messages.
- **Optional notifications** — local daily-message notifications are disabled by default and enabled from Profile.
- **Journal and guided reflection** — private writing and structured thought-reframing surfaces.
- **PHQ-9 and GAD-7** — optional self-report screeners for reflection and trend history, with sensitive-item safety copy.
- **Private compassion wall** — an explicitly local reflection surface; no simulated users, posts, engagement, or collective totals.
- **Local data export and reset** — user data can be exported as JSON and cleared from the device; reset also cancels scheduled daily messages.

---

## One coherent growth system

MoodSignal uses a single canonical growth model:

- **Resonance** is the main growth currency.
- **Mission stages** describe the broad Inner Path arc.
- **Skill-tree levels** show growth in specific areas.
- **Daily quests** provide immediate meaningful actions.
- **Wisdom paths** provide optional structured journeys.
- **Activity rhythm** describes consistency but is not a currency.

The previous Lumen companion/points/badges economy has been removed so the product has one progression language.

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

### Core practice rewards

| Practice | Daily resonance | Skill trees |
|---|---:|---|
| Breath | 15 | Mindfulness |
| Stillness | 15 | Mindfulness, Wisdom |
| Loving-kindness | 18 | Compassion, Relationships |
| Sound | 12 | Mindfulness, Flow |

Rewards are granted once per practice type per day. The practice session itself is still stored every time it is completed.

---

## Main navigation

- **Today** — daily message, check-in, live Inner Path status, next quest, and key tools.
- **Insights** — emotional patterns, baseline, resonance, mission stage, and skill trees.
- **Practices** — direct access to guided practices.
- **365** — daily-message archive.
- **You** — profile, Inner Path entry, notifications, haptics, screeners, export, baseline, sign-out, and reset.

Secondary routes include voice/manual check-in, baseline, journal, guided reflection, sleep mixer, screeners, practices, wisdom paths, quests, mentor, trees, and the private compassion surface.

---

## Repository structure

```text
app/
  _layout.tsx              Root providers, including AppProvider and SideProvider
  index.tsx                Boot gate
  onboarding.tsx           First-run introduction
  sign-in.tsx              Local-first identity; production auth requires Google + Firebase config
  baseline.tsx             Quality-checked voice baseline
  checkin.tsx              Voice check-in and unified recommendation result
  feel.tsx                 Manual check-in and unified recommendation result
  breath.tsx               Breath practice + Inner Path reward
  stillness.tsx            Body scan + Inner Path reward
  meta.tsx                 Loving-kindness + Inner Path reward
  sound.tsx                Sound practice + Inner Path reward
  sleep.tsx                Sleep sound mixer
  coach.tsx                Guided reflection
  journal*.tsx             Journal surfaces
  research.tsx             Screeners, consent, history, export, safety copy
  message/[id].tsx         Daily-message viewport
  (tabs)/                  Today, Insights, Practices, 365, You
  side/                    Inner Path routes: dashboard, paths, quests, trees, mentor, compassion

src/
  components/              Design-system and visualization components
  context/AppContext.tsx   Core app state
  data/messages.ts         365 message engine
  data/wisdom.ts           Tagged recommendation wisdom cards
  lib/                     Voice, recommendations, quest matching, storage, safety, auth, notifications
  side/SideContext.tsx     Resonance, quests, practice rewards, paths, skill-tree state
  side/content.ts          Quest pool, wisdom paths, mission stages
  side/trees.ts            Skill-tree definitions and level calculation
  side/mentor.ts           Mentor-nudge generation
  theme/theme.ts           Design tokens

docs/                      Vision, architecture, roadmap, audits, content, and release checklist
.github/workflows/ci.yml    Pull-request and main-branch TypeScript validation
```

---

## Run locally

```bash
npm install
npm run lint
npx expo start
```

Production builds:

```bash
eas build -p ios
eas build -p android
```

Microphone, notification, audio-session, and deep-link behavior must be tested on physical devices before release.

---

## Current production status

MoodSignal is a substantial prototype moving toward external-beta readiness.

### Completed in the coherence pass

- One app-wide Inner Path state
- One canonical resonance/skill-tree growth model
- Removed obsolete Lumen companion/progress code
- Simplified Today dashboard
- Resonance and skill-tree Insights dashboard
- Manual and voice recommendation parity
- Matched quests for both check-in methods
- Voice sample-quality rejection instead of fabricated fallback data
- Core practice-to-resonance rewards with duplicate protection
- Honest local-first sign-in copy
- Google account sign-in gated behind real Firebase configuration
- Explicit notification opt-in
- Notification reset/cancel behavior scoped to daily messages
- Full reset cancels scheduled daily messages
- Honest private compassion surface
- Core emotion/factor/practice accessibility improvements
- Storage schema-version scaffold
- CI TypeScript workflow

### Release blockers

- Decide and implement the sensitive-data privacy architecture: encrypted local storage, encrypted database, or explicit secure sync.
- Add privacy policy, terms, retention rules, and tested export/deletion behavior.
- Add a dedicated, locale-aware crisis-support route and complete safety review.
- Decide between intentional local-only launch and real production authentication/sync.
- Pass CI and perform iOS/Android release-build testing on physical devices.
- Complete VoiceOver/TalkBack, dynamic-text, contrast, reduced-motion, and touch-target QA.
- Audit quotation attribution and reuse rights across all content.
- Add tests for voice quality, recommendations, screeners, notifications, quests, rewards, and storage migrations.

See [`docs/COHERENCE_AUDIT.md`](docs/COHERENCE_AUDIT.md) for the current whole-app assessment.

---

## Documentation

- [`docs/PRODUCT_VISION.md`](docs/PRODUCT_VISION.md)
- [`docs/COHERENCE_AUDIT.md`](docs/COHERENCE_AUDIT.md)
- [`docs/SIDE_MODULE.md`](docs/SIDE_MODULE.md)
- [`docs/ROADMAP.md`](docs/ROADMAP.md)
- [`docs/PRODUCTION_CHECKLIST.md`](docs/PRODUCTION_CHECKLIST.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/CONTENT_SYSTEM.md`](docs/CONTENT_SYSTEM.md)
- [`docs/REPO_AUDIT.md`](docs/REPO_AUDIT.md)

---

## Development principles

1. Show one primary next action.
2. Treat user self-report as more authoritative than voice estimation.
3. Never fabricate emotional or social signals.
4. Use resonance and skill trees as the only growth economy.
5. Make wisdom and spiritual content optional, practical, and non-coercive.
6. Keep sensitive data local until its privacy architecture is production-grade.
7. Avoid clinical, diagnostic, treatment, and guaranteed-healing claims.
8. Reward meaningful action without shame, gambling mechanics, or compulsive engagement.
