# MoodSignal Side Module

The Side Module is already a major subsystem of MoodSignal. It is the gamified enlightenment layer: daily side quests, resonance, mission stages, wisdom paths, mentor nudges, community prompts, and skill trees.

It should become the bridge between emotional check-ins and long-term growth.

---

## Product Role

The core app answers:

> What state am I in, and what is the wisest next step?

The Side Module answers:

> Who am I becoming through repeated small actions?

It converts practices into an RPG-like growth map without reducing the app to shallow points.

---

## Current Implementation

### Routes

```text
app/side/
  _layout.tsx          SideProvider + side stack navigation
  index.tsx            Side dashboard / Inner Path
  trees.tsx            Full skill tree overview
  mentor.tsx           Mentor guidance
  community.tsx        Gathering/community surface
  path/[id].tsx        Wisdom path detail
  quest/[id].tsx       Quest modal / completion flow
```

### State

`src/side/SideContext.tsx` owns side-module state through `sideState` storage.

Tracked values:

- resonance
- tree XP
- karma
- stewardship
- flow
- quest completions
- active wisdom paths
- daily quest set
- reflection history

### Content

`src/side/content.ts` defines:

- quest types
- daily quest pool
- wisdom paths
- path stages
- quests
- resonance rewards
- mission stages

### Skill Trees

`src/side/trees.ts` defines 11 growth trees:

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

Each quest grants resonance and tree XP. Tree levels are currently based on 40 XP per level, up to 100 levels.

### Mentor

`src/side/mentor.ts` generates nudges from app and side-module state.

Inputs include:

- user name
- last emotion
- days since check-in
- core streak
- resonance
- daily quest completion count
- karma
- stewardship

---

## Resonance

Resonance is the main growth currency. It should represent alignment, practice, and integration — not addictive grinding.

Resonance increases when the user completes meaningful quests such as:

- breath practice
- gratitude
- kindness
- service
- reflection
- movement
- wisdom reading
- purpose/stewardship action
- flow/mushin practice

### Mission Stages

The current side module maps resonance to six mission stages:

1. Stabilize the mind
2. Heal emotional suffering
3. Build positive habits
4. Discover purpose
5. Develop wisdom
6. Live in service

These stages should appear in the main dashboard so the user sees the larger arc.

---

## Wisdom Paths

The current content system includes optional wisdom paths. Paths are presented as practices, not doctrine.

Current path set includes:

- The Five Temples — contemplative Christianity / Gospel of Mary-inspired inner path
- The Seven Habits — responsibility, priority, renewal, relationships
- Acts of Stewardship — purpose through care
- Flow / Mushin-oriented practice
- Heart coherence
- Bodhisattva-inspired compassion/service
- Stoic path
- Wisdom library path

The exact paths are data-driven through `PATHS`, so adding a path should not require new navigation code.

---

## Main Dashboard Integration

The main Today dashboard should eventually show a compact Side Module panel:

- current resonance
- mission stage
- daily quest progress
- one recommended side quest
- top skill tree progress
- entry button: “Open Inner Path”

This lets the user understand the app as one integrated system:

```text
Check in → Receive next step → Complete practice/quest → Gain resonance → Grow skill tree → Advance mission stage
```

---

## Recommendation Integration

The recommendation engine should eventually recommend side quests when appropriate.

Examples:

- Low purpose → Acts of Stewardship quest
- Loneliness → kindness/community quest
- High anxiety → coherent breathing or stillness quest
- Frustration → Stoic dichotomy of control quest
- Scattered/foggy → one visible action quest
- High self-consciousness → mushin/flow quest
- Positive mood → savoring/gratitude quest

The result screen should be able to say:

> Your practice: Breath reset  
> Your wisdom: Return to what is yours  
> Your side quest: One quiet kindness

---

## Production Improvements Needed

- [ ] Surface side module progress on the main Today dashboard.
- [ ] Connect completed core practices to side-module resonance where appropriate.
- [ ] Connect recommendation engine to specific side quests.
- [ ] Add side-module onboarding explaining resonance and wisdom paths.
- [ ] Add anti-compulsion copy: resonance is for reflection, not pressure.
- [ ] Add daily quest reroll or preference filters.
- [ ] Add path preference controls.
- [ ] Add analytics/insights: which trees are growing, which are neglected.
- [ ] Add better empty states for new users.
- [ ] Add tests for daily quest generation, quest completion, path progress, and tree leveling.

---

## Design Principle

The side module should feel like sacred gamification: RPG structure without addictive mechanics. The goal is not more screen time. The goal is repeated meaningful action.

Good reward language:

- resonance
- stewardship
- practice
- integration
- path
- stage
- growth
- mastery

Avoid making the product feel like gambling, grinding, or social comparison.
