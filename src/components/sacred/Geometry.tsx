// Sacred-geometry primitives (pure SVG, composable) — the visual language of the
// mystery school: Merkaba (star tetrahedron), Flower of Life, toroidal rings, and
// a midpoint-displacement lightning generator for the etheric resonance field.
import React from 'react';
import Svg, { Polygon, Circle, Ellipse, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { colors } from '../../theme/theme';

export function pt(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
const poly = (pts: [number, number][]) => pts.map((p) => p.map((n) => n.toFixed(2)).join(',')).join(' ');

/** Star tetrahedron (Merkaba) — two interlocked triangles + inner hex lattice. */
export function Merkaba({
  size,
  topColor = '#b15fb0',
  bottomColor = '#3aa0c9',
  opacity = 0.9,
  stroke = 1.6,
}: {
  size: number;
  topColor?: string;
  bottomColor?: string;
  opacity?: number;
  stroke?: number;
}) {
  const c = size / 2;
  const r = size * 0.44;
  const up = [-90, 30, 150].map((d) => pt(c, c, r, d));
  const down = [90, 210, 330].map((d) => pt(c, c, r, d));
  const hex = [-90, -30, 30, 90, 150, 210].map((d) => pt(c, c, r * 0.5, d));
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id="mk-grad" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor={topColor} />
          <Stop offset="100%" stopColor={bottomColor} />
        </LinearGradient>
      </Defs>
      <Polygon points={poly(up)} fill="none" stroke="url(#mk-grad)" strokeOpacity={opacity} strokeWidth={stroke} strokeLinejoin="round" />
      <Polygon points={poly(down)} fill="none" stroke="url(#mk-grad)" strokeOpacity={opacity * 0.85} strokeWidth={stroke} strokeLinejoin="round" />
      <Polygon points={poly(hex)} fill="none" stroke={topColor} strokeOpacity={opacity * 0.4} strokeWidth={stroke * 0.7} strokeLinejoin="round" />
    </Svg>
  );
}

/** Flower of Life — overlapping circles, a quiet sacred watermark. */
export function FlowerOfLife({ size, color = colors.violet, opacity = 0.16, rings = 2 }: { size: number; color?: string; opacity?: number; rings?: number }) {
  const c = size / 2;
  const r = size / (rings === 1 ? 4 : rings === 2 ? 6 : 8);
  const centers: [number, number][] = [[c, c]];
  for (let ring = 1; ring <= rings; ring++) {
    for (let i = 0; i < 6 * ring; i++) {
      centers.push(pt(c, c, r * ring, (i / (6 * ring)) * 360 - 90));
    }
  }
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G>
        {centers.map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={r} fill="none" stroke={color} strokeOpacity={opacity} strokeWidth={1} />
        ))}
      </G>
    </Svg>
  );
}

/** Toroidal field — nested flattened rings suggesting a torus cross-section. */
export function TorusRings({ size, color = colors.brandBlue, count = 5, opacity = 0.5 }: { size: number; color?: string; count?: number; opacity?: number }) {
  const c = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({ length: count }).map((_, i) => {
        const t = (i + 1) / count;
        return <Ellipse key={i} cx={c} cy={c} rx={c * 0.46 * t + c * 0.1} ry={c * 0.28 * t + c * 0.06} stroke={color} strokeOpacity={opacity * (1 - t * 0.5)} strokeWidth={1.2} fill="none" />;
      })}
    </Svg>
  );
}

/** A jagged lightning path between two points via recursive midpoint displacement. */
export function lightningPath(x1: number, y1: number, x2: number, y2: number, displace: number): string {
  const pts: [number, number][] = [[x1, y1]];
  const recurse = (ax: number, ay: number, bx: number, by: number, d: number) => {
    if (d < 2.5) {
      pts.push([bx, by]);
      return;
    }
    const mx = (ax + bx) / 2 + (Math.random() - 0.5) * d;
    const my = (ay + by) / 2 + (Math.random() - 0.5) * d;
    recurse(ax, ay, mx, my, d / 2);
    recurse(mx, my, bx, by, d / 2);
  };
  recurse(x1, y1, x2, y2, displace);
  return 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L');
}
