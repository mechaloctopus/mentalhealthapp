import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import {
  useFonts,
  AlegreyaSC_700Bold,
  AlegreyaSC_900Black,
} from '@expo-google-fonts/alegreya-sc';
import {
  Alegreya_500Medium,
  Alegreya_700Bold,
} from '@expo-google-fonts/alegreya';
import {
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
} from '@expo-google-fonts/open-sans';
import * as SplashScreen from 'expo-splash-screen';
import { initDb } from '../src/db';
import { getStoredUser, isOnboarded } from '../src/lib/auth';
import { useStore } from '../src/store';
import { getReminderHour } from '../src/lib/notifications';
import { getRecentCheckIns, getRecentJournalEntries } from '../src/db';
import type { CheckIn } from '../src/engine/voice';
import type { JournalEntry } from '../src/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    AlegreyaSC_700Bold,
    AlegreyaSC_900Black,
    Alegreya_500Medium,
    Alegreya_700Bold,
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  const setUser = useStore((s) => s.setUser);
  const setLoading = useStore((s) => s.setLoading);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const setReminderHour = useStore((s) => s.setReminderHour);
  const setRecentCheckIns = useStore((s) => s.setRecentCheckIns);
  const setRecentEntries = useStore((s) => s.setRecentEntries);

  useEffect(() => {
    async function boot() {
      try {
        await initDb();
        const [user, onboarded, reminderHour, rawCheckins, rawEntries] = await Promise.all([
          getStoredUser(),
          isOnboarded(),
          getReminderHour(),
          getRecentCheckIns(90),
          getRecentJournalEntries(60),
        ]);

        setUser(user);
        setOnboarded(onboarded);
        setReminderHour(reminderHour);

        // Map db rows to engine types
        const checkins: CheckIn[] = rawCheckins.map((r) => ({
          id: r.id,
          at: r.at,
          emotion: r.emotion,
          valence: r.valence,
          arousal: r.arousal,
          energy: r.energy ?? 50,
          calmness: r.calmness ?? 50,
          stability: r.stability ?? 70,
          stress: (r.stress as CheckIn['stress']) ?? 'Low',
          confidence: r.confidence ?? 1,
          voiceEmotion: r.voice_emotion ?? r.emotion,
          selfEmotion: r.self_emotion ?? undefined,
          tone: r.emotion,
          baselineShift: r.baseline_shift,
          note: r.note ?? undefined,
          factors: typeof r.factors === 'string' ? JSON.parse(r.factors) : undefined,
          source: r.source,
        }));
        setRecentCheckIns(checkins);

        const entries: JournalEntry[] = rawEntries.map((r) => ({
          id: r.id,
          at: r.at,
          prompt: r.prompt,
          body: r.body,
          emotion: r.emotion,
          type: r.type,
        }));
        setRecentEntries(entries);
      } finally {
        setLoading(false);
        if (fontsLoaded) await SplashScreen.hideAsync();
      }
    }
    if (fontsLoaded) boot();
  }, [fontsLoaded]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="(branches)" />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
