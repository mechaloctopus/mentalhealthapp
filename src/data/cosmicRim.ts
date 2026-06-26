// Cosmic Rim content layer — the lore behind each classical planet and zodiac sign.
// Framed throughout as "explore what resonates," the same non-dogmatic stance as the
// Inner Path wisdom paths (see src/side/pathContext.ts). This is a planetary energy
// and position guide, not a claim of occult fact: myth, traditional correspondence,
// and real astronomical position are kept clearly distinct. Sources cited honestly;
// where traditions disagree (e.g. archangel names vary by grimoire), that's noted.
import type { PlanetId } from '../lib/astronomy';

export interface PlanetLore {
  id: PlanetId;
  name: string;
  glyph: string;
  color: string;
  day: string;
  metal: string;
  /** Traditional Hermetic/grimoire archangel attribution (varies by source — see note). */
  archangel: string;
  /** Babylonian/Mesopotamian deity most commonly identified with this body in antiquity. */
  mesopotamian: string;
  greekRoman: string;
  keyword: string;
  myth: string;
  correspondence: string;
  source: string;
}

export const PLANET_LORE: Record<PlanetId, PlanetLore> = {
  sun: {
    id: 'sun',
    name: 'Sun',
    glyph: '☉',
    color: '#f0bd67',
    day: 'Sunday',
    metal: 'Gold',
    archangel: 'Michael',
    mesopotamian: 'Shamash, the Babylonian sun-god of justice and oaths',
    greekRoman: 'Helios / Apollo (Greek), Sol (Roman)',
    keyword: 'Vitality, identity, will',
    myth: 'In Mesopotamia, Shamash rode the sky each day as the all-seeing judge who could not be deceived. The Greeks split solar duties between Helios, who simply drove the chariot, and Apollo, god of light, prophecy, and order. Across traditions the Sun is the steady center other things orbit — the self that does not flicker.',
    correspondence: 'In Renaissance planetary magic the Sun rules gold, the heart, and the will to lead; its hour is favored for confidence, vitality, and honest dealing rather than concealment.',
    source: 'Cornelius Agrippa, Three Books of Occult Philosophy (1533); Mesopotamian solar religion (Shamash hymns); Greco-Roman myth.',
  },
  moon: {
    id: 'moon',
    name: 'Moon',
    glyph: '☽',
    color: '#cfd6e6',
    day: 'Monday',
    metal: 'Silver',
    archangel: 'Gabriel',
    mesopotamian: 'Sin (Nanna), the Babylonian moon-god who measured the months',
    greekRoman: 'Selene / Artemis (Greek), Luna / Diana (Roman)',
    keyword: 'Mood, memory, the inner tide',
    myth: 'Sin/Nanna kept the calendar of Mesopotamia, his waxing and waning marking sacred time. Selene drove her own quiet chariot through the night; Artemis, wilder, ruled the hunt and the threshold between girlhood and womanhood. The Moon has always stood for what changes on a schedule — mood, water, the body\'s tides.',
    correspondence: 'Traditionally ruling silver, water, and the home; the Moon hour favors reflection, dreams, and tending what is fragile rather than forcing new starts.',
    source: 'Agrippa, Three Books of Occult Philosophy; Mesopotamian lunar religion; Greco-Roman myth.',
  },
  mercury: {
    id: 'mercury',
    name: 'Mercury',
    glyph: '☿',
    color: '#9fc16f',
    day: 'Wednesday',
    metal: 'Quicksilver (mercury)',
    archangel: 'Raphael',
    mesopotamian: 'Nabu, Babylonian god of writing, wisdom, and the scribal arts',
    greekRoman: 'Hermes (Greek), Mercury (Roman)',
    keyword: 'Communication, thought, exchange',
    myth: 'Nabu kept the tablets of destiny and was patron of scribes. Hermes, messenger of the Greek gods, moved freely between Olympus and the underworld, and was as much a trickster and trader as a herald. Mercury\'s myths agree on one thing: this is the planet of the in-between, the go-between, the quick mind.',
    correspondence: 'Said to rule speech, contracts, and travel; its hour is traditionally favored for writing, study, and honest negotiation.',
    source: 'Agrippa, Three Books of Occult Philosophy; Mesopotamian scribal religion (Nabu); Greco-Roman myth.',
  },
  venus: {
    id: 'venus',
    name: 'Venus',
    glyph: '♀',
    color: '#ef786c',
    day: 'Friday',
    metal: 'Copper',
    archangel: 'Anael (also spelled Haniel in some grimoires)',
    mesopotamian: 'Inanna/Ishtar, Babylonian goddess of love and also of war',
    greekRoman: 'Aphrodite (Greek), Venus (Roman)',
    keyword: 'Love, beauty, what we value',
    myth: 'Inanna/Ishtar was no gentle figure — her myths hold love and war together, and her descent to the underworld is one of the oldest stories we have. The Greeks narrowed her into Aphrodite, born of sea-foam, goddess of beauty and desire. Venus has always meant attraction in the broadest sense: what pulls us toward something.',
    correspondence: 'Traditionally rules copper, the arts, and reconciliation; its hour is favored for friendship, beauty, and partnership.',
    source: 'Agrippa, Three Books of Occult Philosophy; the Sumerian/Babylonian Inanna-Ishtar cycle; Greco-Roman myth.',
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    glyph: '♂',
    color: '#ef786c',
    day: 'Tuesday',
    metal: 'Iron',
    archangel: 'Samael (in some later Qabalistic sources, Khamael/Camael)',
    mesopotamian: 'Nergal, Babylonian god of war, plague, and the underworld',
    greekRoman: 'Ares (Greek), Mars (Roman)',
    keyword: 'Drive, conflict, courage',
    myth: 'Nergal ruled the Mesopotamian underworld alongside war and disease — a planet of consequence as much as combat. Ares was the rawest of the Greek gods, more feared than loved even by his own family; Rome elevated its Mars into a more dignified guardian of the state. Mars is the planet of force, for better or worse.',
    correspondence: 'Rules iron, conflict, and decisive action; its hour is traditionally favored for courage and confrontation, and warned against for anything needing patience.',
    source: 'Agrippa, Three Books of Occult Philosophy; Mesopotamian Nergal cycle; Greco-Roman myth.',
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    glyph: '♃',
    color: '#7db9ff',
    day: 'Thursday',
    metal: 'Tin',
    archangel: 'Sachiel',
    mesopotamian: 'Marduk, patron god of Babylon and king of its pantheon',
    greekRoman: 'Zeus (Greek), Jupiter (Roman)',
    keyword: 'Expansion, fortune, meaning',
    myth: 'Marduk earned kingship over the Babylonian gods by defeating the chaos-serpent Tiamat — order won by the planet of growth and rule. Zeus presided over Olympus the same way; Jupiter inherited the role as Rome\'s chief god, patron of law and the state. This is the planet associated with luck, abundance, and the big picture.',
    correspondence: 'Traditionally rules tin, prosperity, and justice; its hour is favored for growth, generosity, and long views.',
    source: 'Agrippa, Three Books of Occult Philosophy; the Babylonian Enūma Eliš (Marduk\'s rise); Greco-Roman myth.',
  },
  saturn: {
    id: 'saturn',
    name: 'Saturn',
    glyph: '♄',
    color: '#8f887c',
    day: 'Saturday',
    metal: 'Lead',
    archangel: 'Cassiel',
    mesopotamian: 'Ninurta (in some Mesopotamian schemes associated with the slowest visible planet)',
    greekRoman: 'Cronus (Greek), Saturn (Roman)',
    keyword: 'Structure, time, limitation',
    myth: 'Cronus, who swallowed his own children to keep his throne, is one of myth\'s starkest pictures of time devouring what it makes — yet Rome\'s Saturn was also the gentle god of a golden-age harvest, honored every December at Saturnalia. Saturn holds both faces: discipline that protects, and limitation that can feel like loss.',
    correspondence: 'Rules lead, boundaries, and endurance; its hour is traditionally favored for discipline, completion of long work, and accepting limits.',
    source: 'Agrippa, Three Books of Occult Philosophy; Greco-Roman myth; comparative Mesopotamian astral religion.',
  },
};

export interface ZodiacLore {
  sign: string;
  glyph: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  ruler: PlanetId;
  keyword: string;
}

export const ZODIAC_LORE: ZodiacLore[] = [
  { sign: 'Aries', glyph: '♈', element: 'Fire', ruler: 'mars', keyword: 'Initiation' },
  { sign: 'Taurus', glyph: '♉', element: 'Earth', ruler: 'venus', keyword: 'Steadiness' },
  { sign: 'Gemini', glyph: '♊', element: 'Air', ruler: 'mercury', keyword: 'Exchange' },
  { sign: 'Cancer', glyph: '♋', element: 'Water', ruler: 'moon', keyword: 'Care' },
  { sign: 'Leo', glyph: '♌', element: 'Fire', ruler: 'sun', keyword: 'Expression' },
  { sign: 'Virgo', glyph: '♍', element: 'Earth', ruler: 'mercury', keyword: 'Refinement' },
  { sign: 'Libra', glyph: '♎', element: 'Air', ruler: 'venus', keyword: 'Balance' },
  { sign: 'Scorpio', glyph: '♏', element: 'Water', ruler: 'mars', keyword: 'Depth' },
  { sign: 'Sagittarius', glyph: '♐', element: 'Fire', ruler: 'jupiter', keyword: 'Horizon' },
  { sign: 'Capricorn', glyph: '♑', element: 'Earth', ruler: 'saturn', keyword: 'Structure' },
  { sign: 'Aquarius', glyph: '♒', element: 'Air', ruler: 'saturn', keyword: 'Perspective' },
  { sign: 'Pisces', glyph: '♓', element: 'Water', ruler: 'jupiter', keyword: 'Dissolution' },
];

export const CHALDEAN_HOUR_NOTE =
  'The "Chaldean order" — Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon — ranks the seven classical planets from (apparently) slowest to fastest as seen from Earth, the order ancient Mesopotamian and Hellenistic astrologers used to assign a ruling planet to each hour of the day and night. It is a traditional reckoning method, not a claim about physical influence.';
