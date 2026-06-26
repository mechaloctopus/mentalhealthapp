import React from 'react';
import { View, StyleSheet, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { ModalHeader } from '../src/components/ModalHeader';
import { Display, Body, Muted, Label, GlassCard, Serif } from '../src/components/ui';
import { CRISIS_SUPPORT, wellnessDisclaimer } from '../src/lib/safety';
import { colors, font, radius, spacing } from '../src/theme/theme';
import { tap } from '../src/lib/haptics';

function open(url: string) {
  tap();
  Linking.openURL(url).catch(() => {});
}

export default function Crisis() {
  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.coral} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ModalHeader title="Crisis support" accent={colors.coral} />
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}>
          <Display style={{ fontSize: 26 }}>{CRISIS_SUPPORT.title}</Display>
          <Body color={colors.text} style={{ marginTop: spacing.sm, marginBottom: spacing.lg, fontSize: 15, lineHeight: 23 }}>
            {CRISIS_SUPPORT.body}
          </Body>

          <Animated.View entering={FadeInDown.duration(450)}>
            <GlassCard accent={colors.coral} style={{ gap: 6, marginBottom: spacing.md }}>
              <Label color={colors.coral}>RIGHT NOW</Label>
              <Body color={colors.text} style={{ fontSize: 14.5, lineHeight: 21 }}>{CRISIS_SUPPORT.action}</Body>
            </GlassCard>
          </Animated.View>

          <Label style={{ marginBottom: 12 }}>REACH SOMEONE NOW — US</Label>
          <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
            <ContactRow
              icon="call"
              title="988 Suicide & Crisis Lifeline"
              sub="Call or text 988, free and 24/7"
              onPress={() => open('tel:988')}
            />
            <ContactRow
              icon="chatbubble-ellipses"
              title="Crisis Text Line"
              sub="Text HOME to 741741"
              onPress={() => open('sms:741741&body=HOME')}
            />
            <ContactRow
              icon="warning"
              title="Emergency services"
              sub="If there is immediate danger, call 911"
              onPress={() => open('tel:911')}
            />
          </View>

          <Label style={{ marginBottom: 12 }}>OUTSIDE THE US</Label>
          <GlassCard style={{ marginBottom: spacing.xl }}>
            <Body color={colors.text} style={{ fontSize: 14, lineHeight: 21 }}>
              Findahelpline.com lists crisis lines by country. Your local emergency number works the same
              way 911 does in the US — use it if you or someone else is in immediate danger.
            </Body>
            <Pressable onPress={() => open('https://findahelpline.com')} hitSlop={8} style={{ marginTop: spacing.sm }} accessibilityRole="link" accessibilityLabel="Open findahelpline.com">
              <Body color={colors.coral} style={{ fontFamily: font.sansSemibold, fontSize: 13.5 }}>findahelpline.com →</Body>
            </Pressable>
          </GlassCard>

          <Serif style={{ fontSize: 18, marginBottom: spacing.sm }}>This app isn't a substitute</Serif>
          <Muted style={{ fontSize: 13, lineHeight: 20 }}>{wellnessDisclaimer()} It cannot see your situation, call for help, or respond in an emergency — a real person can.</Muted>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ContactRow({ icon, title, sub, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; sub: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
      <GlassCard style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.coral + '1a' }]}>
          <Ionicons name={icon} size={18} color={colors.coral} />
        </View>
        <View style={{ flex: 1 }}>
          <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 15 }}>{title}</Body>
          <Muted style={{ fontSize: 12.5 }}>{sub}</Muted>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: spacing.md },
  icon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
