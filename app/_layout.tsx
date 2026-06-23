import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Newsreader_500Medium,
  Newsreader_600SemiBold,
} from '@expo-google-fonts/newsreader';
import { View } from 'react-native';
import { AppProvider } from '../src/context/AppContext';
import { colors } from '../src/theme/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Foreground notifications still surface a banner.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function NotificationRouter() {
  const router = useRouter();
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    const url = response?.notification.request.content.data?.url as string | undefined;
    if (url) {
      // Slight delay so the navigator is mounted before deep-linking.
      const t = setTimeout(() => router.push(url as any), 350);
      return () => clearTimeout(t);
    }
  }, [response, router]);

  return null;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Newsreader_500Medium,
    Newsreader_600SemiBold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="light" />
          <NotificationRouter />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="baseline" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="checkin" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="breath" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="stillness" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="meta" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="sound" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="message/[id]" options={{ presentation: 'modal', animation: 'fade' }} />
          </Stack>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
