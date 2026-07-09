import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { colors, font } from '../../src/theme/tokens';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.panelBorder,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 6,
          height: 60,
        },
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: {
          fontFamily: font.sansSemibold,
          fontSize: 10,
          letterSpacing: 0.4,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16, lineHeight: 20 }}>◎</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: 'Journey',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16, lineHeight: 20 }}>✦</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16, lineHeight: 20 }}>◈</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="signal"
        options={{
          title: 'Signal',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16, lineHeight: 20 }}>≋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: 'You',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16, lineHeight: 20 }}>○</Text>
          ),
        }}
      />
    </Tabs>
  );
}
