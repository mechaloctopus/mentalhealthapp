import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Svg, { Circle, Line, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';
import { EMOTIONS, getEmotion } from '../lib/emotions';
import { colors, font, radius, spacing } from '../theme/theme';
import { select } from '../lib/haptics';

export function EmotionWheel({
  value,
  onChange,
  size = 300,
}: {
  value?: string;
  onChange: (id: string) => void;
  size?: number;
}) {
  const [focused, setFocused] = useState<string | undefined>(value);
  const current = getEmotion(focused ?? value);
  const cx = size / 2;
  const cy = size / 2;
  const radiusValue = size * 0.36;

  const pick = (id: string) => {
    select();
    setFocused(id);
    onChange(id);
  };

  return (
    <View style={{ alignItems: 'center', gap: spacing.md }} accessibilityRole="radiogroup" accessibilityLabel="Choose the feeling that fits best">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill} importantForAccessibility="no-hide-descendants">
          <Defs>
            <RadialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={current.color} stopOpacity={0.22} />
              <Stop offset="100%" stopColor={current.color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={cx} cy={cy} r={radiusValue + 26} fill="url(#wheelGlow)" />
          <Circle cx={cx} cy={cy} r={radiusValue + 10} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
          <Line x1={cx} y1={cy - radiusValue - 6} x2={cx} y2={cy + radiusValue + 6} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
          <Line x1={cx - radiusValue - 6} y1={cy} x2={cx + radiusValue + 6} y2={cy} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        </Svg>

        <Text accessible={false} style={[styles.axis, { top: 0, left: cx - 40, width: 80 }]}>HIGH ENERGY</Text>
        <Text accessible={false} style={[styles.axis, { bottom: 0, left: cx - 40, width: 80 }]}>LOW ENERGY</Text>
        <Text accessible={false} style={[styles.axis, { top: cy - 7, left: 2, width: 64, textAlign: 'left' }]}>UNPLEASANT</Text>
        <Text accessible={false} style={[styles.axis, { top: cy - 7, right: 2, width: 64, textAlign: 'right' }]}>PLEASANT</Text>

        <View pointerEvents="none" accessible={false} style={[styles.center, { left: cx - 56, top: cy - 34, width: 112 }]}>
          <Text style={[styles.centerLabel, { color: current.color }]} numberOfLines={1}>{current.label}</Text>
          <Text style={styles.centerBlurb} numberOfLines={2}>{current.blurb}</Text>
        </View>

        {EMOTIONS.map((emotion) => {
          const x = cx + emotion.valence * radiusValue;
          const y = cy - emotion.arousal * radiusValue;
          const selected = emotion.id === current.id;
          return (
            <Pressable
              key={emotion.id}
              onPress={() => pick(emotion.id)}
              hitSlop={6}
              accessibilityRole="radio"
              accessibilityLabel={`${emotion.label}. ${emotion.blurb}`}
              accessibilityState={{ selected }}
              style={[styles.node, { left: x - (selected ? 22 : 16), top: y - (selected ? 22 : 16), width: selected ? 44 : 32, height: selected ? 44 : 32, borderRadius: 44 }]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: emotion.color, width: selected ? 44 : 32, height: selected ? 44 : 32, borderRadius: 44, borderWidth: selected ? 2 : 0, borderColor: colors.text },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <Animated.View key={current.id} entering={FadeIn.duration(300)} style={styles.nuance} accessible accessibilityLabel={`Related words: ${current.nuance.join(', ')}`}>
        {current.nuance.map((word) => (
          <View key={word} style={[styles.chip, { borderColor: current.color + '55' }]}>
            <Text style={[styles.chipText, { color: current.color }]}>{word}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  axis: { position: 'absolute', color: colors.textFaint, fontFamily: font.sansSemibold, fontSize: 8.5, letterSpacing: 1, textAlign: 'center' },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  centerLabel: { fontFamily: font.serif, fontSize: 22, textAlign: 'center' },
  centerBlurb: { fontFamily: font.sans, fontSize: 11, color: colors.textDim, textAlign: 'center', marginTop: 2 },
  node: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  dot: {},
  nuance: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, backgroundColor: colors.surface1 },
  chipText: { fontFamily: font.sansMedium, fontSize: 12.5 },
});
