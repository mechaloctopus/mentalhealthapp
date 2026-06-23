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
  brand: ['#66e0ca', '#f0bd67'] as const,
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
  // Names match @expo-google-fonts exports, loaded in app/_layout.tsx.
  serif: 'Newsreader_500Medium',
  serifSemibold: 'Newsreader_600SemiBold',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemibold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
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
    shadowColor: colors.teal,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
};

export type AccentColor = (typeof accents)[number];
