import { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Pressable, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../../src/store';
import { saveJournalEntry } from '../../../src/db';
import { awardResonance } from '../../../src/lib/resonance';
import { GlassCard } from '../../../src/components/GlassCard';
import { GradientButton } from '../../../src/components/GradientButton';
import { colors, font, spacing } from '../../../src/theme/tokens';

const PLACEHOLDERS = [
  'Something small that went well…',
  'Someone who showed up for you…',
  'A moment you would want to remember…',
];

export default function JournalGratitude() {
  const [items, setItems] = useState(['', '', '']);
  const [saving, setSaving] = useState(false);
  const addEntry = useStore((s) => s.addEntry);
  const todayCheckIn = useStore((s) => s.todayCheckIn);

  function setItem(idx: number, text: string) {
    setItems((prev) => prev.map((v, i) => (i === idx ? text : v)));
  }

  const filled = items.filter((s) => s.trim().length > 0);
  const canSave = filled.length > 0;

  async function save() {
    if (!canSave) return;
    setSaving(true);
    try {
      const body = filled.map((s, i) => `${i + 1}. ${s.trim()}`).join('\n');
      const entry = {
        id: Math.random().toString(36).slice(2),
        at: Date.now(),
        prompt: 'Three things I am grateful for today.',
        body,
        emotion: todayCheckIn?.emotion ?? null,
        type: 'gratitude' as const,
      };
      addEntry(entry);
      await saveJournalEntry(entry);
      await awardResonance('JOURNAL_GRATITUDE');
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 24 : 0}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>Gratitude</Text>
          <View style={{ width: 52 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.introBanner}>
            <Text style={styles.introText}>
              Name three things you are grateful for today. Be as specific as you can — the more concrete, the more it lands.
            </Text>
          </GlassCard>

          {items.map((item, i) => (
            <GlassCard key={i} style={styles.itemCard}>
              <Text style={styles.itemNumber}>{i + 1}</Text>
              <TextInput
                style={styles.itemInput}
                value={item}
                onChangeText={(t) => setItem(i, t)}
                placeholder={PLACEHOLDERS[i]}
                placeholderTextColor={colors.textFaint}
                multiline
                textAlignVertical="top"
                returnKeyType="next"
              />
            </GlassCard>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <GradientButton
            label={saving ? 'Saving…' : `Save${filled.length > 0 ? ` (${filled.length})` : ''}`}
            onPress={save}
            disabled={!canSave || saving}
            variant="flame"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
  },
  cancel: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.textFaint, minWidth: 52 },
  title: { fontFamily: font.sansSemibold, fontSize: 16, color: colors.text },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  introBanner: { padding: spacing.xl },
  introText: { fontFamily: font.serif, fontSize: 15, color: colors.textMuted, lineHeight: 23 },
  itemCard: { flexDirection: 'row', gap: spacing.md, padding: spacing.xl, alignItems: 'flex-start' },
  itemNumber: { fontFamily: font.displayBold, fontSize: 22, color: colors.amber, lineHeight: 28 },
  itemInput: {
    flex: 1, fontFamily: font.serif, fontSize: 16, color: colors.text,
    lineHeight: 25, minHeight: 52,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
});
