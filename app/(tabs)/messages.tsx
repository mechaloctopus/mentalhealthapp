import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedBackground } from '../../src/components/AnimatedBackground';
import { MessageCard } from '../../src/components/MessageCard';
import { Display, Body, Muted, Label } from '../../src/components/ui';
import { useApp } from '../../src/context/AppContext';
import { MESSAGES, todaysMessage, TYPE_META, type MessageType, type DailyMessage } from '../../src/data/messages';
import { colors, font, radius, spacing } from '../../src/theme/theme';
import { select } from '../../src/lib/haptics';

type Filter = 'all' | 'saved' | MessageType;

const FILTERS: { key: Filter; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: colors.text },
  { key: 'saved', label: 'Saved', color: colors.amber },
  { key: 'affirmation', label: 'Affirmations', color: TYPE_META.affirmation.accent },
  { key: 'devotional', label: 'Devotionals', color: TYPE_META.devotional.accent },
  { key: 'quote', label: 'Quotes', color: TYPE_META.quote.accent },
  { key: 'breath', label: 'Breath', color: TYPE_META.breath.accent },
  { key: 'grounding', label: 'Grounding', color: TYPE_META.grounding.accent },
  { key: 'gratitude', label: 'Gratitude', color: TYPE_META.gratitude.accent },
  { key: 'stillness', label: 'Stillness', color: TYPE_META.stillness.accent },
  { key: 'resilience', label: 'Resilience', color: TYPE_META.resilience.accent },
  { key: 'thought', label: 'Thoughts', color: TYPE_META.thought.accent },
];

export default function Messages() {
  const { saved } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const today = todaysMessage();

  const data = useMemo<DailyMessage[]>(() => {
    if (filter === 'all') return MESSAGES;
    if (filter === 'saved') return MESSAGES.filter((m) => saved.includes(m.id));
    return MESSAGES.filter((m) => m.type === filter);
  }, [filter, saved]);

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.amber} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <FlatList
          data={data}
          keyExtractor={(m) => String(m.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 140 }}
          initialNumToRender={10}
          windowSize={9}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListHeaderComponent={
            <View>
              <View style={styles.header}>
                <Display style={{ fontSize: 32 }}>365 Days</Display>
                <Muted style={{ marginTop: 4 }}>A thoughtful word for every day of the year.</Muted>
              </View>

              <Label style={{ marginBottom: 10 }}>TODAY</Label>
              <MessageCard message={today} featured />

              <View style={{ height: spacing.xl }} />
              <FlatList
                horizontal
                data={FILTERS}
                keyExtractor={(f) => f.key}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingRight: spacing.lg }}
                renderItem={({ item }) => {
                  const on = filter === item.key;
                  return (
                    <Pressable
                      onPress={() => { select(); setFilter(item.key); }}
                      style={[styles.chip, on && { backgroundColor: item.color, borderColor: item.color }]}
                    >
                      <Body style={{ fontFamily: font.sansSemibold, fontSize: 13, color: on ? colors.black : colors.textMuted }}>
                        {item.label}
                      </Body>
                    </Pressable>
                  );
                }}
              />
              <View style={{ height: spacing.lg }} />
            </View>
          }
          renderItem={({ item }) => <MessageCard message={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Body center color={colors.textDim}>
                {filter === 'saved' ? 'No saved words yet. Tap the bookmark on any message to keep it here.' : 'Nothing here yet.'}
              </Body>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xs, marginBottom: spacing.lg },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.panelBorder, backgroundColor: 'rgba(255,255,255,0.04)' },
  empty: { padding: spacing.xl, alignItems: 'center' },
});
