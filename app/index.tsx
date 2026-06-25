import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useApp } from '../src/context/AppContext';
import { setHapticsEnabled } from '../src/lib/haptics';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { BrandMark } from '../src/components/BrandMark';
import { colors } from '../src/theme/theme';

/** Boot gate: routes the user to onboarding, sign-in, baseline, or the app. */
export default function Boot() {
  const { ready, onboarded, user, baseline, prefs } = useApp();

  useEffect(() => {
    setHapticsEnabled(prefs.hapticsOn);
  }, [prefs.hapticsOn]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <AnimatedBackground />
        <BrandMark size={64} />
        <ActivityIndicator color={colors.teal} style={{ marginTop: 28 }} />
      </View>
    );
  }

  if (!onboarded) return <Redirect href="/onboarding" />;
  if (!user) return <Redirect href="/sign-in" />;
  if (!baseline) return <Redirect href="/baseline" />;
  return <Redirect href="/(tabs)" />;
}
