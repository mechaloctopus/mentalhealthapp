import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, Display, Body, Muted, GlassCard } from '../src/components/ui';
import { GradientButton } from '../src/components/GradientButton';
import { BrandMark } from '../src/components/BrandMark';
import { GoogleGlyph } from '../src/components/GoogleGlyph';
import { useApp } from '../src/context/AppContext';
import { signInWithGoogle, continueAnonymously, type User } from '../src/lib/auth';
import { useGoogleSignIn } from '../src/lib/googleAuth';
import { isGoogleConfigured } from '../src/lib/authConfig';
import { scheduleDailyMessages } from '../src/lib/notifications';
import { colors, font, spacing } from '../src/theme/theme';
import { success } from '../src/lib/haptics';

/** Shared presentational Google button so demo + real paths look identical. */
function GoogleCardButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <GlassCard style={styles.googleBtn}>
        <GoogleGlyph size={22} />
        <Body color={colors.text} style={styles.googleLabel}>{label}</Body>
      </GlassCard>
    </Pressable>
  );
}

/**
 * Real Google → Firebase button. The auth hook (which requires client IDs on
 * Android) lives here so it is ONLY mounted when keys are configured — never in
 * demo mode, where it would throw.
 */
function RealGoogleButton({
  busy,
  setBusy,
  onUser,
}: {
  busy: boolean;
  setBusy: (b: 'google' | 'anon' | null) => void;
  onUser: (u: User) => void;
}) {
  const google = useGoogleSignIn(onUser, () => setBusy(null));
  return (
    <GoogleCardButton
      label={busy ? 'Signing in…' : 'Continue with Google'}
      disabled={busy}
      onPress={async () => {
        setBusy('google');
        await google.prompt();
      }}
    />
  );
}

export default function SignIn() {
  const router = useRouter();
  const { setUser, prefs } = useApp();
  const [busy, setBusy] = useState<'google' | 'anon' | null>(null);

  const finish = useCallback(async () => {
    success();
    // Best-effort: arm the year of daily affirmations now that we have consent context.
    scheduleDailyMessages(prefs.notif).catch(() => {});
    router.replace('/baseline');
  }, [prefs.notif, router]);

  const onGoogleUser = useCallback(async (user: User) => {
    await setUser(user);
    await finish();
  }, [setUser, finish]);

  // Demo mode: simulated Google identity so the full app is usable without keys.
  const onGoogleDemo = async () => {
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
        <Muted center style={{ fontSize: 10.5, letterSpacing: 2.5, color: colors.gold, marginTop: -4 }}>A MENDED LIGHT APP</Muted>
        <Body center style={{ maxWidth: 320 }}>
          Research-informed emotional calibration. Sign in to keep your baseline, trends, and saved words in sync.
        </Body>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(600)} style={{ gap: spacing.md, alignSelf: 'stretch' }}>
        {isGoogleConfigured ? (
          <RealGoogleButton busy={busy === 'google'} setBusy={setBusy} onUser={onGoogleUser} />
        ) : (
          <GoogleCardButton
            label={busy === 'google' ? 'Signing in…' : 'Continue with Google'}
            disabled={!!busy}
            onPress={onGoogleDemo}
          />
        )}

        <GradientButton
          label={busy === 'anon' ? 'Starting…' : 'Continue without an account'}
          variant="ghost"
          onPress={onAnon}
          loading={busy === 'anon'}
          full
        />
      </Animated.View>

      <Muted center style={styles.legal}>
        MoodSignal supports self-reflection and wellness. It is not a medical device and does not diagnose or treat any condition.
        {isGoogleConfigured ? '' : ' Google sign-in runs in demo mode until Firebase keys are added.'}
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
