import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { ModalHeader } from '../src/components/ModalHeader';
import { GradientButton } from '../src/components/GradientButton';
import { Muted, Label, GlassCard } from '../src/components/ui';
import { useApp } from '../src/context/AppContext';
import { randomPrompt } from '../src/lib/journalPrompts';
import { EMOTIONS } from '../src/lib/emotions';
import { colors, font, radius, spacing } from '../src/theme/theme';
import { tap, success, select } from '../src/lib/haptics';

export default function JournalNew() {
  const router = useRouter();
  const { addJournal, checkins } = useApp();
  const lastEmotion = checkins[0]?.emotion;
  const [prompt, setPrompt] = useState(() => randomPrompt(lastEmotion));
  const [text, setText] = useState('');
  const [emotion, setEmotion] = useState<string | undefined>(lastEmotion);

  const save = () => {
    if (!text.trim()) return;
    addJournal({ text: text.trim(), prompt, emotion, source: 'journal' });
    success();
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.amber} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ModalHeader title="New entry" accent={colors.amber} />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.body}>
            <Pressable onPress={() => { select(); setPrompt(randomPrompt(lastEmotion)); }}>
              <GlassCard accent={colors.amber} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="bulb-outline" size={18} color={colors.amber} />
                <Muted style={{ flex: 1, color: colors.text, fontFamily: font.serif, fontSize: 16, lineHeight: 22 }}>{prompt}</Muted>
                <Ionicons name="shuffle" size={16} color={colors.textDim} />
              </GlassCard>
            </Pressable>

            <TextInput
              style={styles.input}
              placeholder="Write whatever is true…"
              placeholderTextColor={colors.textFaint}
              multiline
              autoFocus
              value={text}
              onChangeText={setText}
              textAlignVertical="top"
            />

            <Label style={{ marginBottom: 10 }}>TAG A FEELING (OPTIONAL)</Label>
            <View style={styles.emotions}>
              {EMOTIONS.map((e) => {
                const on = emotion === e.id;
                return (
                  <Pressable key={e.id} onPress={() => { select(); setEmotion(on ? undefined : e.id); }} style={[styles.emoChip, on && { backgroundColor: e.color + '22', borderColor: e.color }]}>
                    <View style={[styles.emoDot, { backgroundColor: e.color }]} />
                    <Muted style={{ fontSize: 12, color: on ? colors.text : colors.textMuted }}>{e.label}</Muted>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.footer}>
            <GradientButton label="Save entry" onPress={save} disabled={!text.trim()} full />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.lg },
  input: { minHeight: 140, maxHeight: 240, fontFamily: font.sans, fontSize: 16, lineHeight: 24, color: colors.text, backgroundColor: colors.surface1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.panelBorder, padding: spacing.md },
  emotions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emoChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.panelBorder },
  emoDot: { width: 9, height: 9, borderRadius: 5 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.sm },
});
