import React from 'react';
import {
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewProps,
  ScrollView,
  ScrollViewProps,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme/theme';
import { AnimatedBackground } from './AnimatedBackground';

/* ---------------- Typography ---------------- */
type TypoProps = TextProps & { color?: string; center?: boolean };

export function Display({ style, color, center, ...p }: TypoProps) {
  return <Text {...p} style={[styles.display, color && { color }, center && styles.center, style]} />;
}
export function Title({ style, color, center, ...p }: TypoProps) {
  return <Text {...p} style={[styles.title, color && { color }, center && styles.center, style]} />;
}
export function Serif({ style, color, center, ...p }: TypoProps) {
  return <Text {...p} style={[styles.serif, color && { color }, center && styles.center, style]} />;
}
export function Body({ style, color, center, ...p }: TypoProps) {
  return <Text {...p} style={[styles.body, color && { color }, center && styles.center, style]} />;
}
export function Muted({ style, color, center, ...p }: TypoProps) {
  return <Text {...p} style={[styles.muted, color && { color }, center && styles.center, style]} />;
}
export function Label({ style, color, center, ...p }: TypoProps) {
  return <Text {...p} style={[styles.label, color && { color }, center && styles.center, style]} />;
}

/* ---------------- Layout ---------------- */
export function Screen({
  children,
  tint,
  scroll = true,
  contentStyle,
  edges,
  ...rest
}: {
  children: React.ReactNode;
  tint?: string;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
} & ScrollViewProps) {
  return (
    <View style={styles.flex}>
      <AnimatedBackground tint={tint} />
      <SafeAreaView style={styles.flex} edges={edges ?? ['top']}>
        {scroll ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, contentStyle]}
            {...rest}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, contentStyle]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

/* ---------------- Glass surfaces ---------------- */
export function GlassCard({
  children,
  style,
  accent,
  ...p
}: ViewProps & { accent?: string }) {
  return (
    <View
      {...p}
      style={[
        styles.card,
        accent ? { borderColor: accent + '55' } : null,
        style,
      ]}
    >
      {accent ? <View style={[styles.accentEdge, { backgroundColor: accent }]} /> : null}
      {children}
    </View>
  );
}

export function Chip({ label, color = colors.textMuted, filled }: { label: string; color?: string; filled?: boolean }) {
  return (
    <View
      style={[
        styles.chip,
        filled ? { backgroundColor: color + '22', borderColor: color + '55' } : null,
      ]}
    >
      <Text style={[styles.chipText, { color: filled ? color : colors.textMuted }]}>{label}</Text>
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

export function Row({ children, style, gap = spacing.sm }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[styles.row, { gap }, style]}>{children}</View>;
}

export function SectionHeader({ kicker, title, color = colors.teal }: { kicker?: string; title: string; color?: string }) {
  return (
    <View style={{ gap: 6 }}>
      {kicker ? <Label color={color}>{kicker.toUpperCase()}</Label> : null}
      <Serif style={styles.sectionTitle}>{title}</Serif>
    </View>
  );
}

export function IconPill({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.iconPill, pressed && { opacity: 0.7 }, style]}
      hitSlop={8}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 140, paddingTop: spacing.sm },
  center: { textAlign: 'center' },

  display: { fontFamily: font.serif, fontSize: 38, lineHeight: 44, color: colors.text, letterSpacing: -0.5 },
  title: { fontFamily: font.sansBold, fontSize: 24, lineHeight: 30, color: colors.text, letterSpacing: -0.3 },
  serif: { fontFamily: font.serif, fontSize: 22, lineHeight: 30, color: colors.text },
  body: { fontFamily: font.sans, fontSize: 15.5, lineHeight: 24, color: colors.textMuted },
  muted: { fontFamily: font.sans, fontSize: 13.5, lineHeight: 21, color: colors.textDim },
  label: { fontFamily: font.sansSemibold, fontSize: 11, lineHeight: 14, color: colors.teal, letterSpacing: 1.6 },

  sectionTitle: { fontFamily: font.serif, fontSize: 26, lineHeight: 32, color: colors.text },

  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  accentEdge: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, borderTopLeftRadius: radius.lg, borderBottomLeftRadius: radius.lg },

  chip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  chipText: { fontFamily: font.sansMedium, fontSize: 12, letterSpacing: 0.2 },

  divider: { height: 1, backgroundColor: colors.panelBorder, marginVertical: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },

  iconPill: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.panelBorder,
  },
});
