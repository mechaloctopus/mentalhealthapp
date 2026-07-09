import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FACTORS } from '../content/factors';
import { colors, font, radius, spacing } from '../theme/tokens';

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
}

export function FactorPicker({ selected, onToggle }: Props) {
  return (
    <View style={styles.grid}>
      {FACTORS.map((f) => {
        const active = selected.includes(f.id);
        return (
          <Pressable
            key={f.id}
            onPress={() => onToggle(f.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={styles.emoji}>{f.emoji}</Text>
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {f.label}
            </Text>
          </Pressable>
        );
      })}
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
