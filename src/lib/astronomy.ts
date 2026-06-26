// Real astronomical computation for the dashboard moon widget and the Cosmic Rim module.
// Uses astronomy-engine (VSOP87/ELP2000-derived analytic ephemeris) for actual planet and
// moon positions — never invented or placeholder data. Tropical zodiac convention: 0° = the
// moment of the vernal equinox, each of the 12 signs spans 30° of ecliptic longitude.
import * as Astronomy from 'astronomy-engine';

export type PlanetId = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn';

export const PLANET_ORDER: PlanetId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

const BODY_NAME: Record<PlanetId, Astronomy.Body> = {
  sun: Astronomy.Body.Sun,
  moon: Astronomy.Body.Moon,
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
};

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;
export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export interface PlanetPosition {
  id: PlanetId;
  /** Geocentric apparent ecliptic longitude, 0-360°. */
  longitude: number;
  sign: ZodiacSign;
  signIndex: number;
  /** Degrees into the current sign, 0-30. */
  degreeInSign: number;
}

/** Geocentric apparent ecliptic longitude of a body at a given moment, in degrees [0,360). */
function eclipticLongitude(body: Astronomy.Body, time: Astronomy.AstroTime): number {
  const vector = Astronomy.GeoVector(body, time, true);
  const ecliptic = Astronomy.Ecliptic(vector);
  return ((ecliptic.elon % 360) + 360) % 360;
}

function signFromLongitude(longitude: number): { sign: ZodiacSign; signIndex: number; degreeInSign: number } {
  const signIndex = Math.floor(longitude / 30) % 12;
  return { sign: ZODIAC_SIGNS[signIndex], signIndex, degreeInSign: longitude - signIndex * 30 };
}

/** Real current (or arbitrary-date) positions of the 7 classical planets. */
export function getPlanetPositions(date: Date = new Date()): PlanetPosition[] {
  const time = new Astronomy.AstroTime(date);
  return PLANET_ORDER.map((id) => {
    const longitude = eclipticLongitude(BODY_NAME[id], time);
    return { id, longitude, ...signFromLongitude(longitude) };
  });
}

export type MoonPhaseName =
  | 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous'
  | 'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent';

export interface MoonPhaseInfo {
  /** 0-360°, 0 = new moon, 90 = first quarter, 180 = full, 270 = last quarter. */
  angle: number;
  /** Illuminated fraction of the visible disc, 0-1. */
  illuminatedFraction: number;
  name: MoonPhaseName;
  waxing: boolean;
}

const MOON_PHASE_NAMES: MoonPhaseName[] = [
  'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
];

export function getMoonPhase(date: Date = new Date()): MoonPhaseInfo {
  const time = new Astronomy.AstroTime(date);
  const angle = Astronomy.MoonPhase(time);
  const illumination = Astronomy.Illumination(Astronomy.Body.Moon, time);
  const slot = Math.round(angle / 45) % 8;
  return {
    angle,
    illuminatedFraction: illumination.phase_fraction,
    name: MOON_PHASE_NAMES[slot],
    waxing: angle < 180,
  };
}

/**
 * Chaldean order of the 7 classical planets, slowest to fastest as the ancients
 * reckoned it — the basis of planetary day and planetary-hour rulership.
 */
export const CHALDEAN_ORDER: PlanetId[] = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'];

/** Day-of-week ruler, Sunday-first to match JS Date#getDay(). */
const DAY_RULERS: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

export function getDayRuler(date: Date = new Date()): PlanetId {
  return DAY_RULERS[date.getDay()];
}

/**
 * Planetary hour ruler using the traditional Chaldean sequence, with sunrise/sunset
 * approximated as 06:00/18:00 local time (no location input yet — see docs/COSMIC_RIM.md
 * for the planned location-aware upgrade). Each day is split into 12 day-hours and 12
 * night-hours; hour 1 of the day is always ruled by that day's ruler.
 */
export function getHourRuler(date: Date = new Date()): PlanetId {
  const dayRuler = getDayRuler(date);
  const startIndex = CHALDEAN_ORDER.indexOf(dayRuler);
  const hour = date.getHours();
  const isDaytime = hour >= 6 && hour < 18;
  const hourOfPeriod = isDaytime ? hour - 6 : hour < 6 ? hour + 6 : hour - 18;
  const sequenceIndex = (startIndex + hourOfPeriod) % 7;
  return CHALDEAN_ORDER[sequenceIndex];
}

/**
 * The "dominant" planet for a day: its Chaldean day ruler, unless another classical
 * planet sits within 1° of an exact aspect (conjunction, square, trine) to the Sun —
 * in which case that planet is called out as the day's strongest signal.
 */
export function getDominantPlanet(date: Date = new Date()): { planet: PlanetId; reason: 'day-ruler' | 'close-aspect-to-sun' } {
  const positions = getPlanetPositions(date);
  const sun = positions.find((p) => p.id === 'sun')!;
  const ASPECTS = [0, 60, 90, 120, 180];
  for (const p of positions) {
    if (p.id === 'sun') continue;
    // Angular separation, 0-180°: shift into (-180,180] then take absolute value.
    const separation = Math.abs(((p.longitude - sun.longitude + 540) % 360) - 180);
    if (ASPECTS.some((a) => Math.abs(separation - a) < 1)) {
      return { planet: p.id, reason: 'close-aspect-to-sun' };
    }
  }
  return { planet: getDayRuler(date), reason: 'day-ruler' };
}
