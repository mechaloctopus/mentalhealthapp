// Boot gate — redirects to the right screen based on auth + onboarding state.
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../src/store';
import { colors } from '../src/theme/tokens';

export default function BootGate() {
  const isLoading = useStore((s) => s.isLoading);
  const user = useStore((s) => s.user);
  const onboarded = useStore((s) => s.onboarded);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/sign-in');
    } else if (!onboarded) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)/');
    }
  }, [isLoading, user, onboarded]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.teal} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
