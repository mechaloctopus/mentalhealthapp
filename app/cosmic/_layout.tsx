import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme/theme';

export default function CosmicLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="planet/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="birth" />
      <Stack.Screen name="moon" />
      <Stack.Screen name="hours" />
    </Stack>
  );
}
