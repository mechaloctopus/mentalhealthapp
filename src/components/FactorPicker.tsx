import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FACTORS } from '../lib/factors';
import { colors, font, radius } from '../theme/theme';
import { select } from '../lib/haptics';

export function FactorPicker({
  value,
  onChange,
  accent = colors.teal,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  accent?: string;
}) {
  const toggle = (id: string) => {
    select();
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  };

  return (
    <View style={styles.wrap} accessibilityRole="list" accessibilityLabel="Choose any factors shaping this feeling">
      {FACTORS.map((factor) => {
        const selected = value.includes(factor.id);
        return (
          <Pressable
            key={factor.id}
            onPress={() => toggle(factor.id)}
            style={[styles.chip, selected && { backgroundColor: accent + '22', borderColor: accent + '88' }]}
            accessibilityRole="checkbox"
            accessibilityLabel={factor.label}
            accessibilityState={{ checked: selected }}
          >
            <Ionicons name={factor.icon} size={14} color={selected ? accent : colors.textDim} />
            <Text style={[styles.label, { color: selected ? colors.text : colors.textMuted }]}>{factor.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.panelBorder, backgroundColor: colors.surface1,
  },
  label: { fontFamily: font.sansMedium, fontSize: 12.5 },
});
