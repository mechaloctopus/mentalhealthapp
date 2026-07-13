import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { EMOTIONS, type Emotion } from '../content/emotions';
import { colors, font } from '../theme/tokens';

interface Props {
  selected?: string;
  onSelect: (id: string) => void;
  size?: number;
}

export function EmotionWheel({ selected, onSelect, size = 280 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const innerR = size * 0.18;

  const segments = useMemo(() => {
    return EMOTIONS.map((e, i) => {
      const angle = (i / EMOTIONS.length) * Math.PI * 2 - Math.PI / 2;
      const r = innerR + (outerR - innerR) * (0.35 + 0.5 * (e.valence + 1) / 2);
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return { e, x, y, angle };
    });
  }, [cx, cy, outerR, innerR]);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={outerR} fill={colors.surface1} />
        <Circle cx={cx} cy={cy} r={innerR + (outerR - innerR) * 0.5} fill="none" stroke={colors.hairline} strokeWidth={0.5} />
        <Circle cx={cx} cy={cy} r={innerR} fill={colors.bgRaised} />
        {segments.map(({ e, x, y }) => {
          const isSel = selected === e.id;
          return (
            <G key={e.id}>
              <Circle
                cx={x}
                cy={y}
                r={isSel ? 18 : 13}
                fill={e.color}
                opacity={isSel ? 1 : 0.55}
                onPress={() => onSelect(e.id)}
              />
              {isSel && (
                <SvgText
                  x={x}
                  y={y + 30}
                  textAnchor="middle"
                  fontSize={9}
                  fill={colors.text}
                  fontFamily={font.sansSemibold}
                >
                  {e.label}
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>

      {/* Tap targets overlay — SVG onPress works on Android but not always on iOS */}
      <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
        {segments.map(({ e, x, y }) => (
          <Pressable
            key={e.id + '-tap'}
            onPress={() => onSelect(e.id)}
            style={{
              position: 'absolute',
              left: x - 22,
              top: y - 22,
              width: 44,
              height: 44,
              pointerEvents: 'box-only',
            }}
          />
        ))}
      </View>
    </View>
  );
}
