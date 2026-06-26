# MoodSignal Content System

MoodSignal’s content supports state-aware recommendations, practical wisdom, emotional regulation, purpose, side quests, and long-term growth.

The content system should avoid becoming a pile of unrelated quotes. Every content item should be structured, tagged, and connected to an action.

---

## Current Content Sources

### `src/data/messages.ts`

The app includes a deterministic 365-day message engine with categories such as:

- affirmations
- devotionals
- quotes
- breath cues
- grounding
- gratitude
- stillness
- resilience
- thoughts

This powers daily notifications and message viewports.

### `src/data/wisdom.ts`

This is the lightweight recommendation-facing wisdom card bank.

Wisdom cards are short, tagged, and action-oriented. They are currently used after check-ins through `src/lib/recommendationEngine.ts`.

### `src/lib/purposeEngine.ts`

This is the lightweight recommendation-facing purpose/stewardship prompt bank.

It should eventually be connected to the richer Acts of Stewardship quests in `src/side/content.ts`.

### `src/side/content.ts`

This is the largest live content system in the app.

It defines:

- daily quest pool
- quest kinds
- quest rewards
- mission stages
- wisdom paths
- path stages
- quest lookup helpers

Current live wisdom paths include:

- The Five Temples
- The Seven Habits
- Acts of Stewardship
- Flow / Mushin-oriented practice
- Heart coherence
- Bodhisattva-inspired compassion/service
- Stoicism
- Wisdom Library

This file should be treated as the source of truth for side quests and wisdom paths. Do not create a duplicate side quest system elsewhere.

### `src/side/trees.ts`

This defines the skill-tree taxonomy:

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

## Target Content Types

### Daily Messages

Short messages delivered by notification and opened in a full-screen viewport.

Purpose:

- daily encouragement
- interruption pattern reset
- emotional tone setting
- morning or midday reflection

### Wisdom Cards

Compact, practical cards connected to user state.

Current structure:

```ts
interface WisdomEntry {
  id: string;
  title: string;
  body: string;
  action: string;
  tradition: WisdomTradition;
  tones: WisdomTone[];
  emotions: string[];
  virtues: string[];
  tags: string[];
  practiceRoute?: string;
}
```

### Purpose Prompts

Small stewardship actions.

Examples:

- “Find one thing in the room that needs care.”
- “Send one sincere encouragement.”
- “Clean one surface.”
- “Prepare your body for the next hour: water, breath, posture.”
- “Ask: who near me could use help?”

### Side Quests

Actionable growth tasks defined in `src/side/content.ts`.

Current structure:

```ts
interface Quest {
  id: string;
  title: string;
  instruction: string;
  kind: QuestKind;
  trees: TreeId[];
  resonance: number;
  reflect?: string;
  minutes?: number;
  teaching?: string;
  tradition?: string;
  repeatable?: boolean;
  grants?: QuestGrants;
}
```

### Wisdom Paths

Data-driven journeys composed of stages and quests.

Current structure:

```ts
interface Path {
  id: string;
  title: string;
  subtitle: string;
  tradition: string;
  blurb: string;
  color: string;
  icon: IconName;
  stages: PathStage[];
}
```

### Practice Scripts

Guided text/audio-ready scripts for:

- breathwork
- stillness
- loving-kindness
- sound sessions
- gratitude
- forgiveness
- sleep
- courage
- focus
- flow/mushin
- purpose

### Journal Prompts

Prompts should be short and state-aware.

Examples:

- anxious: “What is one thing you can control in the next ten minutes?”
- sad: “What needs gentleness instead of pressure?”
- angry: “What boundary or value is being signaled?”
- purposeless: “What around you needs care?”
- scattered: “What is the one next visible action?”

### Insight Templates

Reusable language for pattern detection.

Examples:

- “You tend to feel calmer after ____.”
- “Your most common stress factor this week was ____.”
- “Your evening check-ins are more settled than your morning check-ins.”

---

## Wisdom Categories

The app can support multiple wisdom streams while keeping them optional.

Current and planned categories include:

- psychology
- neuroscience-informed regulation
- stoic
- contemplative Christian
- Gospel of Mary / inner stillness
- Buddhist / mindfulness
- Taoist / non-forcing
- Viktor Frankl / meaning
- 7 Habits / responsibility and intentionality
- habit formation
- heart coherence
- flow / mushin
- gratitude
- service / stewardship

Each category should be practical, not academic.

---

## Tagging Model

Content should be tagged by:

### Emotional State

- anxious
- overwhelmed
- frustrated
- sad
- lonely
- drained
- calm
- content
- grateful
- proud
- joy
- excited

### Signal State

- high stress
- low energy
- low calmness
- low stability
- negative baseline shift
- positive baseline shift
- evening wind-down
- morning activation

### Virtue / Skill Tree

- mindfulness
- compassion
- purpose
- wisdom
- fitness
- nutrition
- relationships
- leadership
- service
- creativity
- flow
- courage
- patience
- gratitude
- stewardship
- resilience
- presence

### Practice Type / Quest Kind

- breath
- stillness
- meta
- sound
- journal
- gratitude
- forgiveness
- purpose
- service
- movement
- sleep
- flow
- reflect
- action
- learn
- meditate

### User Preference

- secular
- spiritual
- Christian
- Buddhist
- philosophical
- science-forward
- poetic
- direct

---

## Content Rules

1. Keep content short enough for an activated user.
2. Pair wisdom with one action.
3. Avoid clinical promises.
4. Avoid long copyrighted excerpts unless licensed or public domain and verified.
5. Make spiritual content opt-in or configurable.
6. Avoid shame-based streak language.
7. Use calm, direct, grounded language.
8. Prefer agency: “try,” “notice,” “choose,” “practice.”
9. Avoid deterministic claims: “this will heal you,” “this proves,” “you are depressed.”
10. Make every item useful even if the user only reads it for five seconds.
11. Side-module quests should reward meaningful practice, not compulsive grinding.
12. Wisdom paths should be presented as optional practice paths, not doctrine.

---

## Recommendation Integration

The recommendation engine currently returns:

- one primary practice
- one alternate practice
- one wisdom card
- one purpose action
- one rationale

Next integration step:

- match the recommendation to one existing side quest in `src/side/content.ts`
- prefer unfinished daily quests when relevant
- prefer active-path quests when relevant
- avoid completed non-repeatable quests
- explain why the quest was suggested

The user should not see everything as a cluttered list. The UI should present one primary next step and let the user expand into wisdom, purpose, or a side quest.

---

## Content Expansion Plan

### First Expansion Pass

- connect low-purpose states to existing Acts of Stewardship quests
- connect anxiety/overwhelm to coherent breathing and stillness quests
- connect loneliness/sadness to compassion and service quests
- connect frustration to Stoic control/reflection quests
- connect high self-consciousness to flow/mushin quests

### Next 50 Additions

- 10 anxious/overwhelmed wisdom cards
- 10 sadness/loneliness wisdom cards
- 10 purpose/stewardship prompts or quests
- 10 gratitude/compassion prompts or quests
- 10 sleep/evening prompts

### First 200 Additions

- all major emotions covered
- all current practices represented
- purpose and stewardship sufficiently broad
- morning/midday/evening variants
- secular and spiritual variants

### First 365+ Additions

- daily message bank expanded and tagged
- wisdom bank integrated with check-ins
- purpose bank integrated with low-purpose states
- practice scripts ready for audio generation
- side quests connected to recommendation states

---

## Production Review

Before release, content should be reviewed for:

- mental-health safety
- overclaiming
- spiritual coercion
- cultural sensitivity
- copyright risk
- tone consistency
- app-store compliance
