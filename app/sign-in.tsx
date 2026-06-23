import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, Display, Body, Muted, GlassCard, Serif } from '../src/components/ui';
import { GradientButton } from '../src/components/GradientButton';
import { BrandMark } from '../src/components/BrandMark';
import { GoogleGlyph } from '../src/components/GoogleGlyph';
import { useApp } from '../src/context/AppContext';
import { signInWithGoogle, continueAnonymously } from '../src/lib/auth';
import { scheduleDailyMessages } from '../src/lib/notifications';
import { colors, font, spacing } from '../src/theme/theme';
import { success } from '../src/lib/haptics';

export default function SignIn() {
  const router = useRouter();
  const { setUser, prefs } = useApp();
  const [busy, setBusy] = useState<'google' | 'anon' | null>(null);

  const finish = async () => {
    success();
    // Best-effort: arm the year of daily affirmations now that we have consent context.
    scheduleDailyMessages(prefs.notif).catch(() => {});
    router.replace('/baseline');
  };

  const onGoogle = async () => {
    setBusy('google');
    const user = await signInWithGoogle();
    await setUser(user);
    await finish();
  };

  const onAnon = async () => {
    setBusy('anon');
    const user = await continueAnonymously();
    await setUser(user);
    await finish();
  };

  return (
    <Screen scroll={false} contentStyle={styles.wrap}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.hero}>
        <BrandMark size={72} />
        <Display style={styles.title}>MoodSignal</Display>
        <Body center style={{ maxWidth: 320 }}>
          Research-informed emotional calibration. Sign in to keep your baseline, trends, and saved words in sync.
        </Body>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(600)} style={{ gap: spacing.md, alignSelf: 'stretch' }}>
        <Pressable onPress={onGoogle} disabled={!!busy}>
          <GlassCard style={styles.googleBtn}>
            <GoogleGlyph size={22} />
            <Body color={colors.text} style={styles.googleLabel}>
              {busy === 'google' ? 'Signing in…' : 'Continue with Google'}
            </Body>
          </GlassCard>
        </Pressable>

        <GradientButton
          label={busy === 'anon' ? 'Starting…' : 'Continue without an account'}
          variant="ghost"
          onPress={onAnon}
          loading={busy === 'anon'}
          full
        />
      </Animated.View>

      <Muted center style={styles.legal}>
        MoodSignal supports self-reflection and wellness. It is not a medical device and does not diagnose or treat any condition. Sign-in here is a demo.
      </Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.xxl },
  hero: { alignItems: 'center', gap: spacing.md },
  title: { fontSize: 40, marginTop: spacing.sm },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 16 },
  googleLabel: { fontFamily: font.sansSemibold, fontSize: 15.5 },
  legal: { fontSize: 12, lineHeight: 18, maxWidth: 330, alignSelf: 'center' },
});
