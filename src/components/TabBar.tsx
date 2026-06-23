import React from 'react';
import { StyleSheet, View, Pressable, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, font, radius } from '../theme/theme';
import { select } from '../lib/haptics';

const ICONS: Record<string, { on: keyof typeof Ionicons.glyphMap; off: keyof typeof Ionicons.glyphMap; label: string }> = {
  index: { on: 'today', off: 'today-outline', label: 'Today' },
  voice: { on: 'mic', off: 'mic-outline', label: 'Voice' },
  practices: { on: 'leaf', off: 'leaf-outline', label: 'Practices' },
  messages: { on: 'sparkles', off: 'sparkles-outline', label: '365' },
  profile: { on: 'person', off: 'person-outline', label: 'You' },
};

function TabButton({ focused, icon, label, onPress }: { focused: boolean; icon: typeof ICONS[string]; label: string; onPress: () => void }) {
  const s = useSharedValue(focused ? 1 : 0);
  s.value = withSpring(focused ? 1 : 0, { damping: 16, stiffness: 180 });
  const dot = useAnimatedStyle(() => ({ opacity: s.value, transform: [{ scale: s.value }] }));

  return (
    <Pressable style={styles.item} onPress={onPress} hitSlop={6}>
      <Ionicons name={focused ? icon.on : icon.off} size={23} color={focused ? colors.teal : colors.textDim} />
      <Text style={[styles.label, focused && { color: colors.text }]}>{label}</Text>
      <Animated.View style={[styles.dot, dot]} />
    </Pressable>
  );
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <BlurView intensity={Platform.OS === 'ios' ? 40 : 24} tint="dark" style={styles.bar}>
        <View style={styles.inner}>
          {state.routes.map((route, i) => {
            const meta = ICONS[route.name];
            if (!meta) return null;
            const focused = state.index === i;
            const onPress = () => {
              select();
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            };
            return <TabButton key={route.key} focused={focused} icon={meta} label={meta.label} onPress={onPress} />;
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 14, right: 14, bottom: 0 },
  bar: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.panelBorderStrong,
    backgroundColor: 'rgba(16,18,16,0.6)',
    marginBottom: 8,
  },
  inner: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 6 },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  label: { fontFamily: font.sansMedium, fontSize: 10.5, color: colors.textDim, letterSpacing: 0.2 },
  dot: { width: 5, height: 5, borderRadius: 5, backgroundColor: colors.teal, marginTop: 1 },
});
