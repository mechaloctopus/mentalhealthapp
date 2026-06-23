import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect, Line, G, Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/theme';

/**
 * Atmospheric app canvas: deep navy gradient, two slowly breathing accent glows
 * (soft SVG radial gradients) and a faint grid overlay — MoodSignal's signature backdrop.
 */
function Glow({ color, size, style, anim }: { color: string; size: number; style: object; anim: object }) {
  return (
    <Animated.View style={[{ position: 'absolute', width: size, height: size }, style, anim]} pointerEvents="none">
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={`g-${color}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={0.55} />
            <Stop offset="55%" stopColor={color} stopOpacity={0.18} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#g-${color})`} />
      </Svg>
    </Animated.View>
  );
}

export function AnimatedBackground({ tint = colors.teal }: { tint?: string }) {
  const { width, height } = useWindowDimensions();
  const a = useSharedValue(0);
  const b = useSharedValue(0);

  useEffect(() => {
    a.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true);
    b.value = withRepeat(withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [a, b]);

  const glowA = useAnimatedStyle(() => ({ opacity: 0.6 + a.value * 0.3, transform: [{ scale: 0.92 + a.value * 0.18 }] }));
  const glowB = useAnimatedStyle(() => ({ opacity: 0.45 + b.value * 0.3, transform: [{ scale: 1 + b.value * 0.16 }] }));

  const lines = [];
  const step = 72;
  for (let x = step; x < width; x += step) {
    lines.push(<Line key={`v${x}`} x1={x} y1={0} x2={x} y2={height} stroke="#ffffff" strokeOpacity={0.025} strokeWidth={1} />);
  }
  for (let y = step; y < height; y += step) {
    lines.push(<Line key={`h${y}`} x1={0} y1={y} x2={width} y2={y} stroke="#ffffff" strokeOpacity={0.022} strokeWidth={1} />);
  }

  const glowSize = Math.max(width, height) * 0.95;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={['#0b0e0d', '#090b0b', '#070808']} style={StyleSheet.absoluteFill} />
      <Glow color={tint} size={glowSize} style={{ top: -glowSize * 0.32, left: -glowSize * 0.28 }} anim={glowA} />
      <Glow color={colors.coral} size={glowSize} style={{ bottom: -glowSize * 0.34, right: -glowSize * 0.3 }} anim={glowB} />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="fade" cx="50%" cy="0%" r="90%">
            <Stop offset="0%" stopColor="#000" stopOpacity={0} />
            <Stop offset="100%" stopColor="#070808" stopOpacity={0.55} />
          </RadialGradient>
        </Defs>
        <G>{lines}</G>
        <Rect x={0} y={0} width={width} height={height} fill="url(#fade)" />
      </Svg>
    </View>
  );
}
