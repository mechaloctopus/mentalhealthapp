import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import type { VoiceFeatures } from '../engine/voice';
import { colors, font } from '../theme/tokens';

const AXES = [
  { label: 'Energy',    key: 'energy'          },
  { label: 'Coherence', key: 'coherence'       },
  { label: 'Burst',     key: 'burstRegularity' },
  { label: 'Calmness',  key: 'calmness'        },
  { label: 'Stability', key: 'stability'       },
  { label: 'Slope',     key: 'prosodicSlope'   },
] as const;

type AxisKey = (typeof AXES)[number]['key'];

export interface RadarData {
  energy: number;
  calmness: number;
  stability: number;
  coherence: number;
  burstRegularity: number;
  prosodicSlope: number;
}

export function buildRadarData(
  metrics: { energy: number; calmness: number; stability: number },
  vf?: VoiceFeatures | null,
): RadarData {
  return {
    energy: metrics.energy,
    calmness: metrics.calmness,
    stability: metrics.stability,
    coherence: vf?.voiceCoherence ?? 50,
    burstRegularity: vf?.burstRegularity ?? 50,
    prosodicSlope: vf?.prosodicSlope ?? 50,
  };
}

interface Props {
  today: RadarData;
  baseline?: RadarData | null;
  size?: number;
}

export function VocalRadar({ today, baseline, size = 220 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.36;
  const labelR = size * 0.475;
  const N = AXES.length;

  // Draw-in animation on mount
  const enterScale   = useRef(new Animated.Value(0.72)).current;
  const enterOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(enterScale,   { toValue: 1, tension: 55, friction: 10, useNativeDriver: true }),
      Animated.timing(enterOpacity, { toValue: 1, duration: 520, useNativeDriver: true }),
    ]).start();
  }, []);

  function angleRad(i: number): number {
    return ((i * 360) / N - 90) * (Math.PI / 180);
  }

  function pt(i: number, val: number): { x: number; y: number } {
    const a = angleRad(i);
    const r = (val / 100) * R;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function ring(pct: number): string {
    return Array.from({ length: N }, (_, i) => {
      const a = angleRad(i);
      const r = (pct / 100) * R;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');
  }

  function polygon(data: RadarData): string {
    return AXES.map((ax, i) => {
      const p = pt(i, data[ax.key as AxisKey] as number);
      return `${p.x},${p.y}`;
    }).join(' ');
  }

  return (
    <Animated.View style={{
      width: size, height: size,
      opacity: enterOpacity,
      transform: [{ scale: enterScale }],
    }}>
      <Svg width={size} height={size}>
        {/* Grid rings at 33 / 66 / 100 % */}
        {[33, 66, 100].map((pct) => (
          <Polygon key={pct} points={ring(pct)} fill="none"
            stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
        ))}

        {/* Axis spokes */}
        {AXES.map((_, i) => {
          const { x, y } = pt(i, 100);
          return <Line key={i} x1={cx} y1={cy} x2={x} y2={y}
            stroke="rgba(255,255,255,0.07)" strokeWidth={1} />;
        })}

        {/* Baseline outline (dashed teal) */}
        {baseline && (
          <Polygon points={polygon(baseline)} fill="none"
            stroke={colors.teal} strokeWidth={1.5}
            strokeDasharray="4,3" opacity={0.45} />
        )}

        {/* Today fill + stroke */}
        <Polygon points={polygon(today)}
          fill={colors.violet} fillOpacity={0.18}
          stroke={colors.violet} strokeWidth={2} />

        {/* Today vertex dots */}
        {AXES.map((ax, i) => {
          const val = today[ax.key as AxisKey] as number;
          const { x, y } = pt(i, val);
          return <Circle key={i} cx={x} cy={y} r={3} fill={colors.violet} />;
        })}

        {/* Axis labels */}
        {AXES.map((ax, i) => {
          const a = angleRad(i);
          const lx = cx + labelR * Math.cos(a);
          const ly = cy + labelR * Math.sin(a);
          const anchor = lx < cx - 8 ? 'end' : lx > cx + 8 ? 'start' : 'middle';
          return (
            <SvgText key={i} x={lx} y={ly}
              textAnchor={anchor} fill={colors.textFaint}
              fontSize={8.5} fontFamily={font.sansSemibold}
              alignmentBaseline="middle">
              {ax.label}
            </SvgText>
          );
        })}
      </Svg>
    </Animated.View>
  );
}
