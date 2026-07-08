import { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Pressable, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../../src/store';
import { saveJournalEntry } from '../../../src/db';
import { GlassCard } from '../../../src/components/GlassCard';
import { GradientButton } from '../../../src/components/GradientButton';
import { colors, font, spacing } from '../../../src/theme/tokens';

const PROMPTS = [
  { id: 'three-good', label: 'Three good things', prompt: 'Write three good things that happened today, and briefly — why each happened.' },
  { id: 'gratitude', label: 'Gratitude', prompt: 'What are you grateful for right now? Be as specific as possible.' },
  { id: 'strengths', label: 'Strengths reflection', prompt: 'What did you do well today, or in the last few days? What strength was behind it?' },
  { id: 'worry-reframe', label: 'Worry reframe', prompt: 'What is worrying you right now? What is the evidence for and against this worry? What would you tell a friend in this situation?' },
  { id: 'meaning', label: 'Meaning check', prompt: 'What gave your day meaning today, even briefly? What could you do tomorrow to cultivate more of it?' },
];

export default function JournalReflect() {
  const [selectedPrompt, setSelectedPrompt] = useState<typeof PROMPTS[0] | null>(null);
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const addEntry = useStore((s) => s.addEntry);
  const todayCheckIn = useStore((s) => s.todayCheckIn);

  async function save() {
    if (!body.trim() || !selectedPrompt) return;
    setSaving(true);
    try {
      const entry = {
        id: Math.random().toString(36).slice(2),
        at: Date.now(),
        prompt: selectedPrompt.prompt,
        body: body.trim(),
        emotion: todayCheckIn?.emotion ?? null,
        type: 'reflect' as const,
      };
      addEntry(entry);
      await saveJournalEntry(entry);
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!selectedPrompt) {
    return (
      <SafeAreaView style={styles.root}>
        <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>‹ Journal</Text>
          </Pressable>
          <Text style={styles.title}>Guided Reflect</Text>
          <Text style={styles.sub}>Choose a prompt.</Text>
          <View style={styles.list}>
            {PROMPTS.map((p) => (
              <Pressable key={p.id} onPress={() => setSelectedPrompt(p)}>
                <GlassCard style={styles.promptCard}>
                  <Text style={styles.promptLabel}>{p.label}</Text>
                  <Text style={styles.promptText}>{p.prompt}</Text>
                </GlassCard>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => setSelectedPrompt(null)}>
            <Text style={styles.cancel}>‹ Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{selectedPrompt.label}</Text>
          <Pressable onPress={save} disabled={!body.trim() || saving}>
            <Text style={[styles.saveBtn, (!body.trim() || saving) && styles.saveBtnDim]}>
              {saving ? 'Saving…' : 'Save'}
            </Text>
          </Pressable>
        </View>

        <GlassCard style={styles.promptBanner}>
          <Text style={styles.promptBannerText}>{selectedPrompt.prompt}</Text>
        </GlassCard>

        <TextInput
          style={styles.input}
          value={body}
          onChangeText={setBody}
          multiline
          placeholder="Your reflection…"
          placeholderTextColor={colors.textFaint}
          autoFocus
          textAlignVertical="top"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  back: { paddingTop: spacing.lg },
  backText: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.teal },
  title: { fontFamily: font.display, fontSize: 28, color: colors.text },
  sub: { fontFamily: font.serif, fontSize: 15, color: colors.textMuted },
  list: { gap: spacing.sm },
  promptCard: { padding: spacing.xl, gap: spacing.xs },
  promptLabel: { fontFamily: font.sansBold, fontSize: 14, color: colors.teal },
  promptText: { fontFamily: font.serif, fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
  },
  cancel: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.textFaint },
  headerTitle: { fontFamily: font.sansSemibold, fontSize: 16, color: colors.text },
  saveBtn: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.teal },
  saveBtnDim: { opacity: 0.35 },
  promptBanner: {
    margin: spacing.lg, padding: spacing.lg,
  },
  promptBannerText: { fontFamily: font.serif, fontSize: 15, color: colors.textMuted, lineHeight: 23 },
  input: {
    flex: 1, fontFamily: font.serif, fontSize: 17, color: colors.text,
    paddingHorizontal: spacing.xl, lineHeight: 28,
  },
});
