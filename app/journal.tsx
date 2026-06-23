import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { ModalHeader } from '../src/components/ModalHeader';
import { GradientButton } from '../src/components/GradientButton';
import { Body, Muted, Serif, GlassCard } from '../src/components/ui';
import { useApp } from '../src/context/AppContext';
import { getEmotion } from '../src/lib/emotions';
import { colors, font, spacing } from '../src/theme/theme';
import { tap } from '../src/lib/haptics';

export default function Journal() {
  const router = useRouter();
  const { journal, deleteJournal } = useApp();

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.amber} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ModalHeader title="Journal" accent={colors.amber} />
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}>
          <Serif style={{ fontSize: 26, marginBottom: 4 }}>Your private journal</Serif>
          <Muted style={{ marginBottom: spacing.xl }}>A quiet place to think on paper. Nothing here leaves your device.</Muted>

          {journal.length === 0 ? (
            <GlassCard style={{ alignItems: 'center', gap: 10, paddingVertical: spacing.xl }}>
              <Ionicons name="book-outline" size={30} color={colors.textDim} />
              <Body center color={colors.textDim} style={{ maxWidth: 240 }}>No entries yet. Start with a single honest sentence.</Body>
            </GlassCard>
          ) : (
            <View style={{ gap: spacing.md }}>
              {journal.map((e, i) => (
                <Animated.View key={e.id} entering={FadeInDown.delay(Math.min(i, 6) * 50).duration(400)}>
                  <GlassCard style={{ gap: 8 }} accent={e.emotion ? getEmotion(e.emotion).color : undefined}>
                    <View style={styles.row}>
                      <Muted style={{ fontSize: 12.5 }}>
                        {new Date(e.at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · {new Date(e.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                      </Muted>
                      <View style={styles.rowRight}>
                        {e.source === 'coach' ? <Ionicons name="chatbubbles" size={13} color={colors.lavender} /> : null}
                        {e.emotion ? <View style={[styles.dot, { backgroundColor: getEmotion(e.emotion).color }]} /> : null}
                        <Pressable onPress={() => { tap(); deleteJournal(e.id); }} hitSlop={10}>
                          <Ionicons name="trash-outline" size={15} color={colors.textDim} />
                        </Pressable>
                      </View>
                    </View>
                    {e.prompt ? <Muted style={{ fontStyle: 'italic', fontSize: 13 }}>{e.prompt}</Muted> : null}
                    <Body color={colors.text} style={{ fontSize: 14.5, lineHeight: 22 }}>{e.text}</Body>
                  </GlassCard>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.ScrollView>

        <View style={styles.footer}>
          <GradientButton label="New entry" icon={<Ionicons name="add" size={18} color={colors.black} />} onPress={() => { tap(); router.push('/journal-new'); }} full />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: spacing.sm },
});
