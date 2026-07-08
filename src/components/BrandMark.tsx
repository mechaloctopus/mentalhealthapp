import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../theme/tokens';

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { title: 18, sub: 10 },
  md: { title: 26, sub: 13 },
  lg: { title: 36, sub: 16 },
};

export function BrandMark({ size = 'md' }: Props) {
  const s = SIZES[size];
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontSize: s.title }]}>MoodSignal</Text>
      <Text style={[styles.sub, { fontSize: s.sub }]}>v2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  title: {
    fontFamily: font.display,
    color: colors.text,
    letterSpacing: 0.5,
  },
  sub: {
    fontFamily: font.sansSemibold,
    color: colors.teal,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
});
