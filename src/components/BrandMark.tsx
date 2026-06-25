import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, RadialGradient, Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/theme';

const AView = Animated.createAnimatedComponent(View);

/** The Mended Light flame — violet → indigo → blue, with a living glow. */
export function BrandMark({ size = 48 }: { size?: number }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse]);

  const glow = useAnimatedStyle(() => ({ opacity: 0.45 + pulse.value * 0.4, transform: [{ scale: 0.92 + pulse.value * 0.14 }] }));
  const flame = useAnimatedStyle(() => ({ transform: [{ scale: 0.98 + pulse.value * 0.04 }] }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <AView style={[{ position: 'absolute', width: size, height: size }, glow]} pointerEvents="none">
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="bm-glow" cx="50%" cy="55%" r="50%">
              <Stop offset="0%" stopColor={colors.violet} stopOpacity={0.6} />
              <Stop offset="60%" stopColor={colors.brandBlue} stopOpacity={0.25} />
              <Stop offset="100%" stopColor={colors.brandBlue} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={50} cy={54} r={48} fill="url(#bm-glow)" />
        </Svg>
      </AView>

      <AView style={flame}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="bm-flame" x1="0.5" y1="0" x2="0.5" y2="1">
              <Stop offset="0%" stopColor="#80237B" />
              <Stop offset="52%" stopColor="#1F3277" />
              <Stop offset="100%" stopColor="#3085AC" />
            </LinearGradient>
            <LinearGradient id="bm-inner" x1="0.5" y1="0" x2="0.5" y2="1">
              <Stop offset="0%" stopColor="#c06bd6" />
              <Stop offset="100%" stopColor="#5ec8e0" />
            </LinearGradient>
          </Defs>
          {/* outer flame */}
          <Path
            d="M50 6 C62 26 82 36 73 61 C68 77 60 86 50 92 C40 86 32 77 27 61 C19 40 39 32 50 6 Z"
            fill="url(#bm-flame)"
          />
          {/* inner flame */}
          <Path
            d="M50 30 C57 42 67 49 61 63 C58 72 55 78 50 83 C45 78 42 72 39 63 C34 50 44 44 50 30 Z"
            fill="url(#bm-inner)"
            opacity={0.9}
          />
        </Svg>
      </AView>
    </View>
  );
}
