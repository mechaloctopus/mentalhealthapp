import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { ModalHeader } from '../src/components/ModalHeader';
import { Display, Body, Muted, Serif } from '../src/components/ui';
import { colors, spacing } from '../src/theme/theme';

export default function Terms() {
  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.indigo} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ModalHeader title="Terms of service" accent={colors.indigo} />
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}>
          <Display style={{ fontSize: 26 }}>What MoodSignal is</Display>
          <Muted style={{ marginTop: spacing.sm, marginBottom: spacing.lg, fontSize: 12.5, lineHeight: 19 }}>
            Draft — not legal advice; will be reviewed before a public listing.
          </Muted>

          <Body color={colors.text} style={{ fontSize: 14.5, lineHeight: 22, marginBottom: spacing.lg }}>
            MoodSignal is a personal wellness, reflection, and contemplative-practice app. It is
            not a medical device, does not diagnose or treat any condition, and does not replace
            professional mental health care. Voice-based emotion estimation and self-report
            screeners are reflective wellness tools, not clinical assessments.
          </Body>

          <Body color={colors.coral} style={{ fontSize: 14, lineHeight: 21, marginBottom: spacing.xl, fontWeight: '600' }}>
            If you are in crisis or may be in danger, use Crisis support from Profile or contact
            local emergency services directly — do not rely on this app in an emergency.
          </Body>

          <Serif style={{ fontSize: 18, marginBottom: 8 }}>Acceptable use</Serif>
          <Muted style={{ fontSize: 13, lineHeight: 20, marginBottom: spacing.lg }}>
            Personal, lawful, non-commercial wellness use only. No reverse-engineering, resale,
            or reuse of the app's content (the Inner Path curriculum, Cosmic Rim content) outside
            your own personal use.
          </Muted>

          <Serif style={{ fontSize: 18, marginBottom: 8 }}>Your data</Serif>
          <Muted style={{ fontSize: 13, lineHeight: 20, marginBottom: spacing.lg }}>
            Stored locally on your device as described in the Privacy Policy. You're responsible
            for your device's security. Since nothing is backed up off-device today, we aren't
            liable for data loss from uninstalling the app or resetting your device.
          </Muted>

          <Serif style={{ fontSize: 18, marginBottom: 8 }}>No warranty</Serif>
          <Muted style={{ fontSize: 13, lineHeight: 20, marginBottom: spacing.lg }}>
            Provided "as is." No guarantee of uninterrupted or error-free operation, or that any
            recommendation or practice produces a particular outcome.
          </Muted>

          <Serif style={{ fontSize: 18, marginBottom: 8 }}>Changes</Serif>
          <Muted style={{ fontSize: 13, lineHeight: 20 }}>
            Terms may be updated as the app evolves. Material changes will be reflected here and,
            where required, surfaced in-app before they take effect.
          </Muted>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}
