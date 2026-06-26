import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../../src/components/AnimatedBackground';
import { ModalHeader } from '../../src/components/ModalHeader';
import { GradientButton } from '../../src/components/GradientButton';
import { Display, Body, Muted, Label, GlassCard, Serif, Row } from '../../src/components/ui';
import { getItem, setItem } from '../../src/lib/storage';
import { useSide } from '../../src/side/SideContext';
import { colors, font, spacing } from '../../src/theme/theme';
import { tap, success } from '../../src/lib/haptics';

interface Note {
  id: string;
  text: string;
  at: number;
}

export default function Community() {
  const router = useRouter();
  const side = useSide();
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    getItem<Note[]>('compassionNotes', []).then(setNotes).catch(() => {});
  }, []);

  const saveNote = async () => {
    const text = draft.trim();
    if (!text) return;
    const entry: Note = { id: String(Date.now()), text, at: Date.now() };
    const next = [entry, ...notes].slice(0, 100);
    setNotes(next);
    setDraft('');
    await setItem('compassionNotes', next);
    success();
  };

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.coral} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ModalHeader title="Compassion" accent={colors.coral} />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
            <Display style={{ fontSize: 26 }}>Practice connection</Display>
            <Muted style={{ marginTop: 4, marginBottom: spacing.lg }}>
              This version is private and local. No posts, counts, or activity are shared with other people.
            </Muted>

            <Animated.View entering={FadeInDown.duration(500)}>
              <GlassCard accent={colors.teal} style={{ gap: spacing.md }}>
                <Label color={colors.teal}>SHARED-INTENTION PRACTICE</Label>
                <Serif style={{ fontSize: 20 }}>Sit with the human family in mind</Serif>
                <Body>Take a few minutes to breathe while remembering that many people are also trying, struggling, repairing, and beginning again.</Body>
                <GradientButton label="Begin a quiet sit" onPress={() => { tap(); router.push('/breath'); }} full />
              </GlassCard>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(80).duration(500)} style={{ marginTop: spacing.md }}>
              <GlassCard accent={colors.gold} style={{ gap: 8 }}>
                <Label color={colors.gold}>YOUR CONTRIBUTION</Label>
                <Serif style={{ fontSize: 18 }}>Small actions count</Serif>
                <Body>Your completed compassion and service quests build karma as a private reflection of contribution.</Body>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Muted>Current karma</Muted>
                  <Body color={colors.gold} style={{ fontFamily: font.sansBold }}>{side.karma}</Body>
                </Row>
              </GlassCard>
            </Animated.View>

            <Label style={{ marginTop: spacing.xl, marginBottom: 12 }}>PRIVATE COMPASSION WALL</Label>
            <GlassCard style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: spacing.md }}>
              <TextInput
                style={styles.input}
                placeholder="Write something kind, honest, or worth remembering…"
                placeholderTextColor={colors.textFaint}
                value={draft}
                onChangeText={setDraft}
                multiline
                accessibilityLabel="Private compassion note"
              />
              <Pressable
                onPress={saveNote}
                disabled={!draft.trim()}
                style={[styles.send, { backgroundColor: draft.trim() ? colors.coral : colors.surface3 }]}
                accessibilityRole="button"
                accessibilityLabel="Save private compassion note"
              >
                <Ionicons name="arrow-up" size={18} color={draft.trim() ? colors.black : colors.textDim} />
              </Pressable>
            </GlassCard>

            {notes.length === 0 ? (
              <GlassCard>
                <Muted center>Your private notes will appear here.</Muted>
              </GlassCard>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {notes.map((note) => (
                  <GlassCard key={note.id} style={{ gap: 8 }} accent={colors.coral}>
                    <Body color={colors.text} style={{ fontSize: 14.5, lineHeight: 22 }}>{note.text}</Body>
                    <Muted style={{ fontSize: 11.5 }}>{new Date(note.at).toLocaleString()}</Muted>
                  </GlassCard>
                ))}
              </View>
            )}

            <Muted center style={{ marginTop: spacing.xl, fontSize: 11.5, lineHeight: 17 }}>
              A real community feature requires identity, moderation, reporting, privacy controls, and crisis-safety design before launch.
            </Muted>
          </Animated.ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { flex: 1, maxHeight: 100, minHeight: 40, fontFamily: font.sans, fontSize: 14.5, color: colors.text, paddingVertical: 8 },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
