# Cosmic Rim Roadmap

Cosmic Rim is a side module for symbolic sky awareness. It should feel like a small, beautiful observatory inside MoodSignal: moon phase on the dashboard, a zodiac wheel, seven classical planets, planetary hours, and a reference guide for myth, lore, and symbolic correspondences.

## Naming and positioning

Use the name **Cosmic Rim**.

Avoid presenting the feature as medical, predictive, deterministic, or supernatural certainty. Frame it as:

- symbolic reflection
- sky rhythm awareness
- mythic and historical reference
- contemplative timing
- optional personal meaning

Do not call the module `planetary magic` in user-facing navigation. Historical source pages may reference traditions such as Hermeticism, Agrippa, Chaldean order, Mesopotamian star lore, Greek/Roman mythology, and medieval correspondences when cited and framed as history.

## User-facing module promise

```text
See the moon, the seven classical planets, and the zodiac wheel as a living symbolic map. Compare the sky at your birth with the sky today, then use the current lunar and planetary rhythm as a prompt for reflection.
```

## MVP: Tangible and observable

### Dashboard moon

Add a moon card to Today:

- current moon phase name
- illuminated percentage
- waxing/waning direction
- small visual moon disc
- tap target to Cosmic Rim

### Cosmic Rim home

The first shippable version should include:

- a zodiac wheel placeholder
- seven classical planet glyphs
- twelve zodiac symbols
- current moon phase card
- `Birth Echo` section for future birth chart overlay
- `Today’s Sky` section for current planetary positions
- `Planetary Hours` section for day/hour rulers
- `Reference Library` section for mythology and correspondences

### Seven classical planets

Track only:

| Planet | Glyph | Core symbolic keywords |
|---|---:|---|
| Moon | ☾ | body, memory, emotion, rhythm |
| Mercury | ☿ | speech, skill, trade, analysis |
| Venus | ♀ | beauty, love, harmony, attraction |
| Sun | ☉ | vitality, clarity, authority, purpose |
| Mars | ♂ | action, heat, courage, conflict |
| Jupiter | ♃ | growth, law, wisdom, blessing |
| Saturn | ♄ | time, structure, limits, discipline |

### Twelve zodiac symbols

| Sign | Glyph |
|---|---:|
| Aries | ♈︎ |
| Taurus | ♉︎ |
| Gemini | ♊︎ |
| Cancer | ♋︎ |
| Leo | ♌︎ |
| Virgo | ♍︎ |
| Libra | ♎︎ |
| Scorpio | ♏︎ |
| Sagittarius | ♐︎ |
| Capricorn | ♑︎ |
| Aquarius | ♒︎ |
| Pisces | ♓︎ |

## Data architecture

### Phase 1: No external API

Use deterministic placeholder data and clearly label it as a preview. This allows the UI and content model to exist before astronomical calculations are wired in.

### Phase 2: Real moon phase

Implement a local moon phase calculation:

- current lunar age
- phase name
- illumination estimate
- waxing/waning
- next new moon / full moon estimate if feasible

### Phase 3: Real planetary longitudes

Add an astronomy source:

Options to evaluate:

- local ephemeris package if compatible with React Native
- server-side ephemeris endpoint
- NASA/JPL-derived data through a backend, if licensing and performance are acceptable
- Swiss Ephemeris only if licensing is reviewed carefully

Store for each body:

```ts
type PlanetPosition = {
  planet: 'moon' | 'mercury' | 'venus' | 'sun' | 'mars' | 'jupiter' | 'saturn';
  glyph: string;
  longitudeDeg: number;
  sign: ZodiacSign;
  signGlyph: string;
  signDegree: number;
  isRetrograde?: boolean;
};
```

### Phase 4: Birth echo

Ask the user for:

- birth date
- birth time
- birth location

Privacy requirement: explain why the data is requested, whether it stays local, and how to delete it.

Visual behavior:

- draw birth positions as semi-transparent glyphs on the wheel
- animate to today’s positions as brighter current glyphs
- allow toggle: Birth Echo / Today / Compare

### Phase 5: Planetary hours

Implement the Chaldean order:

```text
Saturn -> Jupiter -> Mars -> Sun -> Venus -> Mercury -> Moon
```

Use:

- local sunrise time
- local sunset time
- 12 daylight planetary hours
- 12 nighttime planetary hours
- day ruler based on weekday

This requires either a sunrise/sunset calculation or a location permission-free manual city/timezone selection.

## Dominant planet logic

Keep this symbolic and transparent. Do not imply guaranteed outcomes.

Initial scoring model:

- day ruler: +3
- current planetary hour ruler: +3
- moon sign ruler: +2
- planet near angle or highlighted position in later AR view: +1
- user-selected intention alignment: +1

Output example:

```text
Today leans Mercury: speech, skill, study, trade, and clean communication are highlighted.
```

## Reference library structure

Each planet page should include:

- glyph
- visual planet card
- astronomy basics
- mythic names across cultures
- Greek/Roman associations
- Mesopotamian/Sumerian/Babylonian references where sourced
- Hermetic/medieval correspondences where sourced
- colors, metals, plants, animals, and days/hours as historical correspondences
- archangel/intelligence/spirit names only in a clearly labeled historical-esoteric section
- reflection prompt
- practical operator prompt
- citations

## Content safety rules

- No promises of healing, protection, wealth, romance, or success.
- No deterministic predictions.
- No instructions framed as required ritual behavior.
- No medical, financial, or relationship decisions based on astrology.
- Keep it optional, symbolic, reflective, and historical.
- Clearly separate astronomy data from mythology and correspondences.

## AR long-term direction

The future AR version should behave like a minimal Stellarium-like sky layer:

- device orientation maps the visible sky
- planets render in approximate actual direction
- constellations render as tasteful line art
- no Earth model required
- user can tap a planet to open its reference page
- offline fallback should still show the zodiac wheel

## Implementation order

1. Static Cosmic Rim screen with glyphs and roadmap sections.
2. Link from Today Explore.
3. Add dashboard moon card.
4. Add local moon phase calculation.
5. Add real planetary position service or local ephemeris.
6. Add birth echo input and overlay.
7. Add planetary hours.
8. Add planet reference pages with citations.
9. Add constellation lore.
10. Add AR sky view.

## First release acceptance criteria

- The module is visitable.
- It has no unsupported claims.
- It is visually coherent with MoodSignal.
- It explains what is live, what is preview, and what is planned.
- It can be expanded without rewriting navigation.
