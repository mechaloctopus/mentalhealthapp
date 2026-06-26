import React, { useCallback, useState } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, Display, Body, Muted, GlassCard } from '../src/components/ui';
import { GradientButton } from '../src/components/GradientButton';
import { BrandMark } from '../src/components/BrandMark';
import { GoogleGlyph } from '../src/components/GoogleGlyph';
import { useApp } from '../src/context/AppContext';
import { continueAnonymously, type User } from '../src/lib/auth';
import { useGoogleSignIn } from '../src/lib/googleAuth';
import { isFirebaseConfigured, isGoogleConfigured } from '../src/lib/authConfig';
import { scheduleDailyMessages } from '../src/lib/notifications';
import { colors, font, spacing } from '../src/theme/theme';
import { success } from '../src/lib/haptics';

const CAN_USE_GOOGLE_AUTH = isFirebaseConfigured && isGoogleConfigured;

function GoogleButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}>
      <GlassCard style={styles.googleBtn}>
        <GoogleGlyph size={22} />
        <Body color={colors.text} style={styles.googleLabel}>{label}</Body>
      </GlassCard>
    </Pressable>
  );
}

function RealGoogleButton({ busy, setBusy, onUser }: { busy: boolean; setBusy: (value: 'google' | 'anon' | null) => void; onUser: (user: User) => void }) {
  const google = useGoogleSignIn(onUser, () => setBusy(null));
  return <GoogleButton label={busy ? 'Signing in…' : 'Continue with Google'} disabled={busy || !google.ready} onPress={async () => { setBusy('google'); await google.prompt(); }} />;
}

export default function SignIn() {
  const router = useRouter();
  const { setUser, prefs, baseline } = useApp();
  const [busy, setBusy] = useState<'google' | 'anon' | null>(null);

  const finish = useCallback(async () => {
    success();
    if (prefs.notif.enabled) scheduleDailyMessages(prefs.notif).catch(() => {});
    router.replace(baseline ? '/(tabs)' : '/baseline');
  }, [baseline, prefs.notif, router]);

  const onGoogleUser = useCallback(async (user: User) => {
    await setUser(user);
    await finish();
  }, [finish, setUser]);

  const onLocal = async () => {
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
        <Muted center style={styles.brand}>A MENDED LIGHT APP</Muted>
        <Body center style={{ maxWidth: 320 }}>Your wellness data currently stays on this device.</Body>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(600)} style={styles.actions}>
        {CAN_USE_GOOGLE_AUTH ? <RealGoogleButton busy={busy === 'google'} setBusy={setBusy} onUser={onGoogleUser} /> : null}
        <GradientButton label={busy === 'anon' ? 'Starting…' : 'Continue with a local profile'} variant={CAN_USE_GOOGLE_AUTH ? 'ghost' : 'brand'} onPress={onLocal} loading={busy === 'anon'} full />
      </Animated.View>

      <Muted center style={styles.legal}>
        MoodSignal is a wellness and self-reflection aid. Cloud sync is not enabled yet.
      </Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.xxl },
  hero: { alignItems: 'center', gap: spacing.md },
  title: { fontSize: 40, marginTop: spacing.sm },
  brand: { fontSize: 10.5, letterSpacing: 2.5, color: colors.gold, marginTop: -4 },
  actions: { gap: spacing.md, alignSelf: 'stretch' },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 16 },
  googleLabel: { fontFamily: font.sansSemibold, fontSize: 15.5 },
  legal: { fontSize: 12, lineHeight: 18, maxWidth: 330, alignSelf: 'center' },
});
