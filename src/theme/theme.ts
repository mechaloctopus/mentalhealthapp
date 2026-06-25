// MoodSignal design system — deep navy canvas, contemplative accents, glass surfaces.

export const colors = {
  // canvas
  bg: '#090b0b',
  bgRaised: '#101210',
  bgDeep: '#070808',

  // glass panels
  panel: 'rgba(24,27,26,0.72)',
  panelSolid: '#181b1a',
  panelBorder: 'rgba(247,244,236,0.08)',
  panelBorderStrong: 'rgba(247,244,236,0.14)',

  // translucent surface scale (tokenizes repeated rgba whites)
  surface1: 'rgba(255,255,255,0.03)',
  surface2: 'rgba(255,255,255,0.05)',
  surface3: 'rgba(255,255,255,0.08)',
  surfaceActive: 'rgba(255,255,255,0.12)',
  hairline: 'rgba(255,255,255,0.06)',

  // text
  text: '#f7f4ec',
  textMuted: '#c8c1b2',
  textDim: '#8f887c',
  textFaint: '#6b665d',

  // accents
  teal: '#66e0ca',
  moss: '#9fc16f',
  amber: '#f0bd67',
  coral: '#ef786c',
  lavender: '#b6a7ff',
  blue: '#7db9ff',

  // Mended Light brand palette (#80237B violet, #1F3277 indigo, #064559 teal,
  // #3085AC blue) — brightened slightly for contrast on the dark canvas.
  violet: '#b15fb0',
  violetDeep: '#80237B',
  indigo: '#5468c4',
  indigoDeep: '#1F3277',
  brandBlue: '#3aa0c9',
  brandTeal: '#0a6e8a',

  // Retained warm accent (used by some emotion/streak UI).
  gold: '#e8c98a',
  goldDeep: '#caa765',

  black: '#050606',
  white: '#ffffff',
  danger: '#ef786c',
  success: '#9fc16f',
} as const;

export const accents = [
  colors.teal,
  colors.moss,
  colors.amber,
  colors.coral,
  colors.lavender,
  colors.blue,
] as const;

export const gradients = {
  // The Mended Light flame: violet → indigo → blue.
  brand: ['#80237B', '#1F3277', '#3085AC'] as const,
  flame: ['#80237B', '#1F3277', '#3085AC'] as const,
  flameSoft: ['rgba(128,35,123,0.30)', 'rgba(48,133,172,0.10)'] as const,
  gold: ['#f0d6a0', '#caa765'] as const,
  brandSoft: ['rgba(102,224,202,0.22)', 'rgba(240,189,103,0.10)'] as const,
  canvas: ['#0b0e0d', '#090b0b', '#070808'] as const,
  coral: ['#ef786c', '#f0bd67'] as const,
  lavender: ['#b6a7ff', '#7db9ff'] as const,
  teal: ['#66e0ca', '#7db9ff'] as const,
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 31,
  pill: 999,
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 32,
  xxl: 48,
} as const;

export const font = {
  // Mended Light brand typography (per the 2022 Style Guide):
  // headers = Alegreya SC, body = Open Sans, serif body = Alegreya.
  display: 'AlegreyaSC_700Bold',
  displayBold: 'AlegreyaSC_900Black',
  serif: 'Alegreya_500Medium',
  serifSemibold: 'Alegreya_600SemiBold',
  sans: 'OpenSans_400Regular',
  sansMedium: 'OpenSans_500Medium',
  sansSemibold: 'OpenSans_600SemiBold',
  sansBold: 'OpenSans_700Bold',
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
};

export type AccentColor = (typeof accents)[number];
