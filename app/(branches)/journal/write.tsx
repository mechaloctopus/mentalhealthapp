import { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Pressable, TextInput,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../../src/store';
import { saveJournalEntry } from '../../../src/db';
import { GradientButton } from '../../../src/components/GradientButton';
import { colors, font, spacing, radius } from '../../../src/theme/tokens';

export default function JournalWrite() {
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const addEntry = useStore((s) => s.addEntry);
  const todayCheckIn = useStore((s) => s.todayCheckIn);

  async function save() {
    if (!body.trim()) return;
    setSaving(true);
    try {
      const entry = {
        id: Math.random().toString(36).slice(2),
        at: Date.now(),
        prompt: null,
        body: body.trim(),
        emotion: todayCheckIn?.emotion ?? null,
        type: 'free' as const,
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
          <Text style={styles.title}>Free write</Text>
          <View style={{ width: 52 }} />
        </View>

        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>

        <TextInput
          style={styles.input}
          value={body}
          onChangeText={setBody}
          multiline
          placeholder="What's on your mind?"
          placeholderTextColor={colors.textFaint}
          autoFocus
          textAlignVertical="top"
        />

        <View style={styles.footer}>
          <GradientButton
            label={saving ? 'Saving…' : 'Save Entry'}
            onPress={save}
            disabled={!body.trim() || saving}
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
  date: {
    fontFamily: font.sansSemibold, fontSize: 12, color: colors.textFaint,
    paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, letterSpacing: 0.3,
  },
  input: {
    flex: 1,
    fontFamily: font.serif, fontSize: 17, color: colors.text,
    paddingHorizontal: spacing.xl, lineHeight: 28,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
});
