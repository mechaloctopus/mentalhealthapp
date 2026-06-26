import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { AlegreyaSC_700Bold, AlegreyaSC_900Black } from '@expo-google-fonts/alegreya-sc';
import { Alegreya_500Medium, Alegreya_600SemiBold } from '@expo-google-fonts/alegreya';
import {
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
} from '@expo-google-fonts/open-sans';
import { AppProvider } from '../src/context/AppContext';
import { SideProvider } from '../src/side/SideContext';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { colors } from '../src/theme/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function isAppRoute(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//');
}

function NotificationRouter() {
  const router = useRouter();
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    const url = response?.notification.request.content.data?.url;
    if (typeof url === 'string' && isAppRoute(url)) {
      const timer = setTimeout(() => router.push(url as any), 350);
      return () => clearTimeout(timer);
    }
  }, [response, router]);

  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    AlegreyaSC_700Bold,
    AlegreyaSC_900Black,
    Alegreya_500Medium,
    Alegreya_600SemiBold,
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  useEffect(() => {
    const timer = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppProvider>
            <SideProvider>
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
                <Stack.Screen name="goals" />
                <Stack.Screen name="sign-in" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="baseline" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="checkin" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="feel" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="coach" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="journal" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="journal-new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="sleep" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="research" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="breath" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="stillness" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="meta" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="sound" options={{ animation: 'slide_from_bottom' }} />
                <Stack.Screen name="side" />
                <Stack.Screen name="cosmic" />
                <Stack.Screen name="message/[id]" options={{ presentation: 'modal', animation: 'fade' }} />
              </Stack>
            </SideProvider>
          </AppProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
