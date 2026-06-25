# MoodSignal Content System

MoodSignal’s content should support state-aware recommendations, practical wisdom, emotional regulation, purpose, and long-term growth.

The content system should avoid becoming a pile of unrelated quotes. Every content item should be structured, tagged, and connected to an action.

---

## Current Content

The current app includes a deterministic 365-day message engine with categories such as:

- affirmations
- devotionals
- quotes
- breath cues
- grounding
- gratitude
- stillness
- resilience
- thoughts

This is a good foundation for daily notifications and message viewports.

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

Example structure:

```ts
interface WisdomEntry {
  id: string;
  title: string;
  body: string;
  action: string;
  tradition: WisdomTradition;
  tags: WisdomTag[];
  emotions: string[];
  virtues: string[];
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

Recommended categories:

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

### Virtue

- courage
- patience
- compassion
- discipline
- gratitude
- humility
- wisdom
- stewardship
- resilience
- presence

### Practice Type

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

---

## Example Wisdom Entry

```ts
const example = {
  id: 'purpose-stewardship-001',
  title: 'Purpose begins with care',
  body: 'You do not need to solve your whole life right now. Look around. Something near you can be cared for.',
  action: 'Choose one small thing in your environment and improve it for two minutes.',
  tradition: 'purpose',
  tags: ['purpose', 'stewardship', 'low-energy', 'overwhelmed'],
  emotions: ['drained', 'sad', 'overwhelmed'],
  virtues: ['stewardship', 'discipline'],
  practiceRoute: '/purpose'
};
```

---

## Recommendation Integration

The recommendation engine should be able to request:

- one primary practice
- one wisdom card
- one optional journal prompt
- one optional purpose action

The user should not see all of these as a cluttered list. The UI should present one primary next step and allow expansion.

---

## Content Expansion Plan

### First 50 Additions

- 10 anxious/overwhelmed wisdom cards
- 10 sadness/loneliness wisdom cards
- 10 purpose/stewardship prompts
- 10 gratitude/compassion prompts
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
