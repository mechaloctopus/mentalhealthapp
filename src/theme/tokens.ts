// MoodSignal v2 design tokens — single source of truth, derived from Mended Light brand guide.
// NO hex values, font names, or spacing numbers anywhere else in the codebase.

export const colors = {
  // ── Canvas (deep navy / almost-black) ──────────────────────────────
  bg:              '#090b0b',
  bgRaised:        '#101210',
  bgDeep:          '#070808',

  // ── Glass surfaces ─────────────────────────────────────────────────
  panel:           'rgba(24,27,26,0.72)',
  panelSolid:      '#181b1a',
  panelBorder:     'rgba(247,244,236,0.08)',
  panelBorderStrong:'rgba(247,244,236,0.14)',
  surface1:        'rgba(255,255,255,0.03)',
  surface2:        'rgba(255,255,255,0.05)',
  surface3:        'rgba(255,255,255,0.08)',
  surfaceActive:   'rgba(255,255,255,0.12)',
  hairline:        'rgba(255,255,255,0.06)',

  // ── Text ───────────────────────────────────────────────────────────
  text:            '#f7f4ec',
  textMuted:       '#c8c1b2',
  textDim:         '#8f887c',
  textFaint:       '#6b665d',

  // ── Mended Light brand palette (brightened for dark canvas) ────────
  violet:          '#b15fb0',   // brightened from #80237B
  violetDeep:      '#80237B',   // exact brand violet
  indigo:          '#5468c4',   // brightened from #1F3277
  indigoDeep:      '#1F3277',   // exact brand indigo
  brandBlue:       '#3aa0c9',   // brightened from #3085AC
  brandTeal:       '#0a6e8a',   // brightened from #064559

  // ── Functional accents ─────────────────────────────────────────────
  teal:            '#66e0ca',
  moss:            '#9fc16f',
  amber:           '#f0bd67',
  coral:           '#ef786c',
  lavender:        '#b6a7ff',
  blue:            '#7db9ff',
  gold:            '#e8c98a',

  // ── Semantic ───────────────────────────────────────────────────────
  danger:          '#ef786c',
  success:         '#9fc16f',
  white:           '#ffffff',
  black:           '#050606',
} as const;

export const gradients = {
  // The Mended Light flame: violet → indigo → blue (brand law).
  flame:     ['#80237B', '#1F3277', '#3085AC'] as const,
  flameSoft: ['rgba(128,35,123,0.30)', 'rgba(48,133,172,0.10)'] as const,
  canvas:    ['#0b0e0d', '#090b0b', '#070808'] as const,
  teal:      ['#66e0ca', '#7db9ff'] as const,
  lavender:  ['#b6a7ff', '#7db9ff'] as const,
  amber:     ['#f0d6a0', '#e8c98a'] as const,
  coral:     ['#ef786c', '#f0bd67'] as const,
} as const;

export const font = {
  // Mended Light brand typography (from 2022 Style Guide):
  display:       'AlegreyaSC_700Bold',      // headers / display
  displayBold:   'AlegreyaSC_900Black',
  serif:         'Alegreya_500Medium',      // quotes / body
  serifBold:     'Alegreya_700Bold',
  sans:          'OpenSans_400Regular',     // UI body
  sansMedium:    'OpenSans_500Medium',
  sansSemibold:  'OpenSans_600SemiBold',
  sansBold:      'OpenSans_700Bold',
} as const;

export const radius = {
  xs:   8,
  sm:   12,
  md:   18,
  lg:   24,
  xl:   32,
  pill: 999,
} as const;

export const spacing = {
  xs:   6,
  sm:   10,
  md:   16,
  lg:   22,
  xl:   32,
  xxl:  48,
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.42,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
    elevation: 12,
  },
  glow: {
    shadowColor: colors.violet,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
} as const;

export type Color = keyof typeof colors;
