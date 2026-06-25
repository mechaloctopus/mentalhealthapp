import React from 'react';
import { Stack } from 'expo-router';
import { SideProvider } from '../../src/side/SideContext';
import { colors } from '../../src/theme/theme';

export default function SideLayout() {
  return (
    <SideProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="trees" />
        <Stack.Screen name="mentor" />
        <Stack.Screen name="community" />
        <Stack.Screen name="path/[id]" />
        <Stack.Screen name="quest/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </SideProvider>
  );
}
