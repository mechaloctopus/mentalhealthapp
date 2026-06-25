import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { ModalHeader } from '../src/components/ModalHeader';
import { GradientButton } from '../src/components/GradientButton';
import { Body, Muted, Label } from '../src/components/ui';
import { useApp } from '../src/context/AppContext';
import { REFLECT_FLOW, buildJournalFromSession, type CoachContext, type CoachInput } from '../src/lib/coach';
import { getEmotion } from '../src/lib/emotions';
import { colors, font, radius, spacing } from '../src/theme/theme';
import { tap, select, success } from '../src/lib/haptics';

interface Msg { role: 'guide' | 'user'; text: string }

export default function Coach() {
  const router = useRouter();
  const { user, checkins, addJournal } = useApp();
  const accent = colors.lavender;

  const ctx = useRef<CoachContext>({
    emotionLabel: getEmotion(checkins[0]?.emotion).label,
    name: (user?.name ?? 'friend').split(' ')[0],
    answers: {},
  }).current;

  const [stepIndex, setStepIndex] = useState(0);
  const [messages, setMessages] = useState<Msg[]>([{ role: 'guide', text: REFLECT_FLOW[0].message(ctx) }]);
  const [draft, setDraft] = useState('');
  const [ended, setEnded] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const step = REFLECT_FLOW[stepIndex];
  const input: CoachInput = step.input(ctx);

  const scrollDown = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

  const answer = (value: string) => {
    if (!value.trim()) return;
    ctx.answers[step.id] = value;
    const next = stepIndex + 1;
    const newMsgs: Msg[] = [...messages, { role: 'user', text: value }];
    if (next < REFLECT_FLOW.length) {
      newMsgs.push({ role: 'guide', text: REFLECT_FLOW[next].message(ctx) });
      setStepIndex(next);
      if (REFLECT_FLOW[next].input(ctx).kind === 'end') setEnded(true);
    }
    setMessages(newMsgs);
    setDraft('');
    scrollDown();
    select();
  };

  const saveToJournal = () => {
    const text = buildJournalFromSession(ctx);
    if (text) addJournal({ text, prompt: 'Guided reflection', emotion: checkins[0]?.emotion, source: 'coach' });
    success();
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={accent} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ModalHeader title="Your guide" accent={accent} />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
          <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.chat} onContentSizeChange={scrollDown}>
            <View style={styles.guideIntro}>
              <View style={[styles.avatar, { backgroundColor: accent + '22', borderColor: accent + '55' }]}>
                <Ionicons name="sparkles" size={18} color={accent} />
              </View>
              <Muted style={{ flex: 1, fontSize: 12.5 }}>A private, guided reflection grounded in CBT. Take your time — there are no wrong answers.</Muted>
            </View>

            {messages.map((m, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.duration(350)}
                style={[styles.bubble, m.role === 'guide' ? styles.guide : [styles.user, { backgroundColor: accent }]]}
              >
                <Body color={m.role === 'guide' ? colors.text : colors.black} style={{ fontSize: 15, lineHeight: 22 }}>{m.text}</Body>
              </Animated.View>
            ))}
          </ScrollView>

          <View style={styles.inputZone}>
            {input.kind === 'choice' && (
              <View style={styles.choices}>
                {input.options.map((o) => (
                  <Pressable key={o} onPress={() => answer(o)} style={[styles.choice, { borderColor: accent + '66' }]}>
                    <Body color={colors.text} style={{ fontSize: 13.5, fontFamily: font.sansMedium }}>{o}</Body>
                  </Pressable>
                ))}
              </View>
            )}

            {input.kind === 'text' && (
              <View style={styles.composer}>
                <TextInput
                  style={styles.field}
                  placeholder={input.placeholder}
                  placeholderTextColor={colors.textFaint}
                  value={draft}
                  onChangeText={setDraft}
                  multiline
                  onSubmitEditing={() => answer(draft)}
                />
                <Pressable onPress={() => answer(draft)} disabled={!draft.trim()} style={[styles.send, { backgroundColor: draft.trim() ? accent : colors.surface3 }]}>
                  <Ionicons name="arrow-up" size={20} color={draft.trim() ? colors.black : colors.textDim} />
                </Pressable>
              </View>
            )}

            {input.kind === 'end' && (
              <View style={{ gap: spacing.sm }}>
                <GradientButton label="Save this to my journal" onPress={saveToJournal} full />
                <GradientButton label="Done" variant="ghost" onPress={() => { tap(); router.back(); }} full />
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  chat: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  guideIntro: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.sm },
  avatar: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  bubble: { maxWidth: '88%', paddingHorizontal: spacing.md, paddingVertical: 12, borderRadius: 20 },
  guide: { alignSelf: 'flex-start', backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.panelBorder, borderTopLeftRadius: 6 },
  user: { alignSelf: 'flex-end', borderTopRightRadius: 6 },
  inputZone: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.sm },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: radius.pill, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  field: { flex: 1, maxHeight: 120, minHeight: 48, fontFamily: font.sans, fontSize: 15, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.panelBorder, paddingHorizontal: spacing.md, paddingVertical: 12 },
  send: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
