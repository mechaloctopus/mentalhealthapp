// Renders the real current moon phase (illuminated fraction + waxing/waning) as an SVG
// disc. The terminator is approximated with the standard two-arc technique — a real,
// commonly used graphical approximation of the lit/dark boundary, driven by real ephemeris
// data from src/lib/astronomy.ts, never a placeholder phase.
import React from 'react';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '../theme/theme';
import type { MoonPhaseInfo } from '../lib/astronomy';

export function MoonPhaseGlyph({ phase, size = 64 }: { phase: MoonPhaseInfo; size?: number }) {
  const r = size / 2 - 1.5;
  const cx = size / 2;
  const cy = size / 2;
  const k = Math.min(1, Math.max(0, phase.illuminatedFraction));
  const sweep = phase.waxing ? 1 : 0;
  const sweep2 = phase.waxing ? 0 : 1;
  const rx = Math.max(0.001, Math.abs((1 - 2 * k) * r));
  const litPath = `M ${cx},${cy - r} A ${r},${r} 0 0 ${sweep} ${cx},${cy + r} A ${rx},${r} 0 0 ${sweep2} ${cx},${cy - r}`;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="moon-dark" cx="35%" cy="30%" r="75%">
          <Stop offset="0%" stopColor="#2a2d33" />
          <Stop offset="100%" stopColor="#0c0e12" />
        </RadialGradient>
        <RadialGradient id="moon-lit" cx="35%" cy="30%" r="75%">
          <Stop offset="0%" stopColor="#fdf6e3" />
          <Stop offset="100%" stopColor="#dcd0a8" />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={r} fill="url(#moon-dark)" stroke={colors.panelBorderStrong} strokeWidth={1} />
      <Path d={litPath} fill="url(#moon-lit)" />
    </Svg>
  );
}
