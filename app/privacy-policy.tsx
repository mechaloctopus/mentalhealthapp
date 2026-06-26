import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { ModalHeader } from '../src/components/ModalHeader';
import { Display, Body, Muted, Label, GlassCard, Serif } from '../src/components/ui';
import { colors, spacing } from '../src/theme/theme';

const DATA_ROWS = [
  ['Local profile', 'Name, optional email from sign-in/onboarding'],
  ['Voice baseline', 'Acoustic features from your one-time baseline recording'],
  ['Check-ins', 'Voice or self-reported emotion and derived metrics'],
  ['Journal entries', 'Free text you write'],
  ['Screener results', 'Optional, opt-in PHQ-9 / GAD-7 self-report scores'],
  ['Practice sessions', 'Which practices you did and for how long'],
  ['Inner Path state', 'Quest progress, skill trees, resonance'],
  ['Preferences', 'Notification time, haptics, focus goal'],
];

export default function PrivacyPolicy() {
  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.teal} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ModalHeader title="Privacy policy" accent={colors.teal} />
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}>
          <Display style={{ fontSize: 26 }}>Your data stays on this device</Display>
          <Muted style={{ marginTop: spacing.sm, marginBottom: spacing.lg, fontSize: 12.5, lineHeight: 19 }}>
            Draft — written to match what the app actually does today, not aspirational language.
            Not legal advice; will be reviewed before a public listing.
          </Muted>

          <GlassCard accent={colors.teal} style={{ marginBottom: spacing.lg, gap: 8 }}>
            <Body color={colors.text} style={{ fontSize: 14.5, lineHeight: 22 }}>
              MoodSignal stores your check-ins, journal entries, screener results, practice
              history, and Inner Path progress only on your device. Nothing is uploaded to us —
              there is no server that receives your check-ins, journal, or voice recordings.
            </Body>
          </GlassCard>

          <Label style={{ marginBottom: 12 }}>WHAT WE STORE — ALL ON-DEVICE</Label>
          <GlassCard style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
            {DATA_ROWS.map(([label, desc]) => (
              <View key={label} style={{ marginBottom: 4 }}>
                <Body color={colors.text} style={{ fontWeight: '600', fontSize: 14 }}>{label}</Body>
                <Muted style={{ fontSize: 12.5 }}>{desc}</Muted>
              </View>
            ))}
          </GlassCard>

          <Serif style={{ fontSize: 18, marginBottom: 8 }}>Voice audio is never saved</Serif>
          <Muted style={{ fontSize: 13, lineHeight: 20, marginBottom: spacing.lg }}>
            The microphone stream is analyzed in memory on-device for loudness/timing features
            and discarded. Only the derived numeric features above are saved.
          </Muted>

          <Serif style={{ fontSize: 18, marginBottom: 8 }}>Third parties</Serif>
          <Muted style={{ fontSize: 13, lineHeight: 20, marginBottom: spacing.lg }}>
            Google Sign-In (optional) handles its own authentication — we only receive your
            name/email/avatar. Firebase is present as a dependency for a future sync feature but
            is not wired up to send your wellness data anywhere yet. No analytics, crash
            reporting, or advertising SDK collects your usage today.
          </Muted>

          <Serif style={{ fontSize: 18, marginBottom: 8 }}>Your controls</Serif>
          <Muted style={{ fontSize: 13, lineHeight: 20 }}>
            Export everything as JSON, or delete everything immediately, both from Profile.
            Crisis support is always reachable from Profile, never gated behind another flow.
            Notifications can be turned off entirely.
          </Muted>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({});
