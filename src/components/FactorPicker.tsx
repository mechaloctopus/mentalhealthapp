import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { FACTORS, type Factor } from '../content/factors';
import { colors, font, radius, spacing } from '../theme/tokens';

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
}

interface ChipProps {
  factor: Factor;
  active: boolean;
  onToggle: () => void;
}

function FactorChip({ factor, active, onToggle }: ChipProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onToggle}
        onPressIn={() => { scale.value = withSpring(0.90, { stiffness: 520, damping: 18 }); }}
        onPressOut={() => { scale.value = withSpring(1,    { stiffness: 380, damping: 16 }); }}
        style={[styles.chip, active && styles.chipActive]}
      >
        <Text style={styles.emoji}>{factor.emoji}</Text>
        <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
          {factor.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function FactorPicker({ selected, onToggle }: Props) {
  return (
    <View style={styles.grid}>
      {FACTORS.map((f) => (
        <FactorChip
          key={f.id}
          factor={f}
          active={selected.includes(f.id)}
          onToggle={() => onToggle(f.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    backgroundColor: colors.surface2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: `${colors.violet}1a`,
    borderColor: `${colors.violet}55`,
  },
  emoji: {
    fontSize: 13,
  },
  label: {
    fontFamily: font.sans,
    fontSize: 12,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.violet,
    fontFamily: font.sansSemibold,
  },
});
