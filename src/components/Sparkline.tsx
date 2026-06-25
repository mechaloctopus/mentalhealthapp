import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Defs, LinearGradient, Stop, Polygon, Circle } from 'react-native-svg';
import { colors } from '../theme/theme';

/** Minimal trend sparkline for a series of 0–100 values (oldest → newest). */
export function Sparkline({
  values,
  width = 300,
  height = 64,
  color = colors.teal,
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (values.length < 2) return <View style={{ width, height }} />;
  const pad = 6;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const max = 100;
  const min = 0;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * w;
    const y = pad + (1 - (v - min) / (max - min)) * h;
    return [x, y] as const;
  });
  const line = pts.map((p) => p.join(',')).join(' ');
  const area = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`;
  const lastPt = pts[pts.length - 1];

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Polygon points={area} fill="url(#spark)" />
      <Polyline points={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      <Circle cx={lastPt[0]} cy={lastPt[1]} r={4} fill={color} />
    </Svg>
  );
}
