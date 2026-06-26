# Cosmic Rim

A planetary energy and position guide. **Not magic, not prediction.** Every position
shown is computed from a real astronomical ephemeris; every myth, archangel name, or
"hour ruler" is traditional lore, clearly labeled as lore — the same non-dogmatic,
"explore what resonates" stance as the Inner Path (see `docs/SIDE_MODULE.md`,
`docs/CONTENT_SYSTEM.md`). Cosmic Rim is a **separate module from the Inner Path** —
it does not award karma/resonance/XP and is not gamified.

## Why it exists

The Inner Path is about character and practice. Cosmic Rim is about a different kind
of engagement: a beautiful, accurate small-cosmos to explore — closer to a pocket
planetarium with a layer of cultural history than to a self-improvement system. It
should be visually striking, factually honest about what's computed vs. traditional,
and safe to dip into without ever feeling like a horoscope app making predictions
about the user's life.

## Real-data invariant

Every planet position, moon phase, illumination fraction, and day/hour ruler is
computed live by `src/lib/astronomy.ts` using
[`astronomy-engine`](https://github.com/cosinekitty/astronomy) (a VSOP87/ELP2000-class
analytic ephemeris, MIT-licensed, no network dependency). Nothing about position or
phase is hardcoded, randomized, or seeded — this satisfies the same no-fake-data
invariant enforced repo-wide by `scripts/check-invariants.mjs`. Only the *interpretive*
layer (myths, correspondences, archangel names, folk meanings) is editorial content,
and it is always presented as tradition, not fact.

## What's tracked

- **7 classical planets** (the pre-telescope set, each with a single recognizable
  glyph): Sun ☉, Moon ☽, Mercury ☿, Venus ♀, Mars ♂, Jupiter ♃, Saturn ♄.
- **12 zodiac signs** (tropical convention — 0° ecliptic longitude = the vernal
  equinox, each sign spans 30°), with their standard glyphs.
- Geocentric apparent ecliptic longitude for each planet, recomputed per render.
- Moon phase name (8-phase model), illuminated fraction, waxing/waning.
- Chaldean day ruler (`getDayRuler`) and Chaldean hour ruler (`getHourRuler`).
- A "dominant planet" callout (`getDominantPlanet`): the day's Chaldean ruler, unless
  another planet sits within ~1° of an exact conjunction/sextile/square/trine/opposition
  to the Sun, in which case that planet is called out as the day's strongest signal.

## Where it lives in the app

| Screen | Route | Purpose |
|---|---|---|
| Cosmic Rim home | `app/cosmic/index.tsx` | The zodiac wheel with live planet positions, today's dominant planet, this-hour ruler, moon mini-card, links to the three guides below. |
| Planet detail | `app/cosmic/planet/[id].tsx` | Tap any glyph: myth & legend, Agrippa-style correspondences, archangel name, source citation, and a disclaimer that attributions vary by grimoire. |
| Birth echo | `app/cosmic/birth.tsx` | Enter birth date (+ optional time) → see a semi-transparent "echo" of the birth-moment planet positions overlaid on today's live positions on the same wheel. Stored locally only (`KEYS.cosmicBirth` in `src/lib/storage.ts`), never synced. |
| Moon watcher guide | `app/cosmic/moon.tsx` | Current phase + the full 8-phase cycle with traditional folk meanings for each. |
| Planetary hours | `app/cosmic/hours.tsx` | Today's Chaldean ruler, the Chaldean order, and an hour-by-hour table for the current day. |

Entry points: a "Cosmic Rim" card in the dashboard `EXPLORE` list
(`app/(tabs)/index.tsx`), plus a "TONIGHT'S SKY" moon-phase widget on the main
dashboard itself (real phase, via `MoonPhaseGlyph` + `getMoonPhase`), independent of
whether the user ever opens the full module.

## Known v1 limitations (by design, not oversight)

- **Birth chart uses local-clock midday when no time is given.** This is accurate for
  every planet except the Moon, which can drift up to roughly one sign either side
  across a day without a known birth time — stated explicitly in `birth.tsx`.
- **No location/timezone input yet.** Birth echo and the planetary-hours table both
  assume the device's local clock and (for hours) a flat 06:00/18:00 sunrise/sunset
  approximation rather than the user's real latitude/longitude and date-specific
  sunrise/sunset. This is a known simplification, called out in-app in `hours.tsx`.
- **No house system.** Only sign placement (which 30° slice of the zodiac a planet
  sits in) is shown — not astrological houses, which require an accurate birth
  location and time and a choice of house system. Out of scope until location input
  exists.

## Planned, not built (future scope)

- **Location-aware sunrise/sunset** for accurate planetary hours and a real Ascendant.
- **AR "pocket Stellarium" mode**: real-time augmented-reality view of where the 7
  planets and the Moon actually are relative to the user's pointed device — space only,
  no Earth-surface horizon rendering, accurate positioning via the same `astronomy-engine`
  layer. This is a meaningfully larger feature (camera, device orientation/compass
  sensors, 3D projection) and is intentionally deferred; this doc exists so the shape
  of the work is already scoped when it's picked up.
- **Constellation lore beyond the zodiac** — Sumerian/Babylonian constellation material
  (e.g. MUL.APIN tradition) as further optional reading, sourced the same way the
  zodiac and planet lore is (see Sources below).
- **House system** once location input exists.

## Sources

- Planet glyphs, days, and metals: standard Hermetic/Renaissance correspondence tables.
- Myth & "Greco-Roman" / "Mesopotamian" content: Mesopotamian astral religion (Shamash,
  Sin/Nanna, Nabu, Ishtar/Inanna, Nergal, Marduk) and standard Greco-Roman mythology,
  summarized per-planet in `src/data/cosmicRim.ts`.
- Correspondences and archangel names: Cornelius Agrippa, *Three Books of Occult
  Philosophy* (1533) — the most widely cited Renaissance source for planetary magic
  correspondences. Archangel attributions vary across grimoires; this is explicitly
  noted in the planet-detail screen rather than presented as settled.
- Chaldean order and hour-ruler method: traditional Hellenistic/Mesopotamian
  astrological reckoning, summarized in `CHALDEAN_HOUR_NOTE` (`src/data/cosmicRim.ts`).
- Moon phase folk meanings (`PHASE_NOTES` in `app/cosmic/moon.tsx`): cross-cultural folk
  and contemplative association, explicitly labeled non-predictive, non-medical.
- Astronomical computation: [astronomy-engine](https://github.com/cosinekitty/astronomy)
  (Don Cross, MIT license) — VSOP87/ELP2000-derived analytic ephemeris.

This list should be extended in `docs/CONTENT_SOURCES.md` alongside the Inner Path
citations as Cosmic Rim content grows (e.g. if Sumerian constellation lore is added).
