import React, { useState } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../../../src/components/AnimatedBackground';
import { ModalHeader } from '../../../src/components/ModalHeader';
import { GradientButton } from '../../../src/components/GradientButton';
import { Display, Body, Muted, Label, GlassCard, Serif, Row } from '../../../src/components/ui';
import { useSide } from '../../../src/side/SideContext';
import { getQuest, pathOfQuest } from '../../../src/side/content';
import { TREE_BY_ID } from '../../../src/side/trees';
import { colors, font, radius, spacing } from '../../../src/theme/theme';
import { tap, success } from '../../../src/lib/haptics';

const KIND_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  reflect: 'create', action: 'flash', meditate: 'moon', breath: 'leaf',
  learn: 'book', service: 'hand-left', gratitude: 'heart', flow: 'pulse',
};

export default function QuestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const side = useSide();
  const quest = getQuest(String(id));
  const path = pathOfQuest(String(id));
  const accent = path?.color ?? colors.lavender;

  const [reflection, setReflection] = useState('');
  const [justDone, setJustDone] = useState(false);

  if (!quest) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }}><SafeAreaView style={{ flex: 1 }}><ModalHeader title="Quest" /></SafeAreaView></View>;
  }

  const alreadyDone = quest.repeatable ? side.isDoneToday(quest.id) : side.isCompleted(quest.id);
  const complete = () => {
    side.completeQuest(quest.id, reflection);
    success();
    setJustDone(true);
  };

  const close = () => { tap(); router.back(); };

  if (justDone) {
    return (
      <View style={{ flex: 1 }}>
        <AnimatedBackground tint={accent} />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <ModalHeader title="Quest complete" accent={accent} />
          <Animated.View entering={FadeIn} style={styles.doneWrap}>
            <View style={[styles.doneBadge, { borderColor: accent + '55', backgroundColor: accent + '14' }]}>
              <Ionicons name="checkmark" size={40} color={accent} />
            </View>
            <Display center style={{ fontSize: 28, marginTop: spacing.lg }}>+{quest.resonance} Resonance</Display>
            <Muted center style={{ marginTop: 6, maxWidth: 300 }}>The signal grows a little stronger. Small actions, repeated.</Muted>
            <View style={styles.grewRow}>
              {quest.trees.map((tid) => {
                const t = TREE_BY_ID[tid];
                return (
                  <View key={tid} style={[styles.grewChip, { borderColor: t.color + '55' }]}>
                    <Ionicons name={t.icon} size={13} color={t.color} />
                    <Muted style={{ fontSize: 12, color: colors.textMuted }}>{t.label} +{quest.resonance}</Muted>
                  </View>
                );
              })}
            </View>
            {(quest.grants?.karma || quest.grants?.stewardship || quest.grants?.flow) ? (
              <Muted center style={{ marginTop: spacing.md, fontSize: 12.5 }}>
                {quest.grants?.karma ? `+${quest.grants.karma} karma  ` : ''}
                {quest.grants?.stewardship ? `+${quest.grants.stewardship} stewardship  ` : ''}
                {quest.grants?.flow ? `+${quest.grants.flow} flow` : ''}
              </Muted>
            ) : null}
          </Animated.View>
          <View style={styles.footer}>
            <GradientButton label="Done" onPress={close} full />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={accent} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ModalHeader title={path ? path.title : 'Daily quest'} accent={accent} />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 30 }}>
            <Row gap={10}>
              <View style={[styles.kind, { backgroundColor: accent + '22', borderColor: accent + '55' }]}>
                <Ionicons name={KIND_ICON[quest.kind] ?? 'ellipse'} size={18} color={accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Label color={accent}>{(quest.tradition ?? quest.kind).toUpperCase()}</Label>
                <Muted style={{ fontSize: 12 }}>+{quest.resonance} resonance{quest.minutes ? ` · ${quest.minutes} min` : ''}</Muted>
              </View>
            </Row>

            <Display style={{ fontSize: 28, marginTop: spacing.md }}>{quest.title}</Display>

            {quest.teaching ? (
              <GlassCard accent={accent} style={{ marginTop: spacing.lg }}>
                <Serif style={{ fontSize: 17, lineHeight: 27 }}>{quest.teaching}</Serif>
              </GlassCard>
            ) : null}

            <GlassCard style={{ marginTop: spacing.lg, gap: 6 }}>
              <Label color={accent}>THE PRACTICE</Label>
              <Body color={colors.text} style={{ fontSize: 16, lineHeight: 25 }}>{quest.instruction}</Body>
            </GlassCard>

            {quest.reflect ? (
              <View style={{ marginTop: spacing.lg }}>
                <Label style={{ marginBottom: 10 }}>REFLECTION (OPTIONAL)</Label>
                <TextInput
                  style={styles.input}
                  placeholder={quest.reflect}
                  placeholderTextColor={colors.textFaint}
                  value={reflection}
                  onChangeText={setReflection}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            ) : null}

            {alreadyDone ? (
              <GlassCard style={{ marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="checkmark-circle" size={18} color={colors.moss} />
                <Muted style={{ color: colors.moss }}>{quest.repeatable ? 'Completed today — come back tomorrow.' : 'Already completed.'}</Muted>
              </GlassCard>
            ) : null}
          </Animated.ScrollView>

          <View style={styles.footer}>
            <GradientButton
              label={alreadyDone ? 'Done for today' : 'Mark complete'}
              onPress={alreadyDone ? close : complete}
              disabled={false}
              full
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  kind: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  input: { minHeight: 110, fontFamily: font.sans, fontSize: 15.5, lineHeight: 23, color: colors.text, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.panelBorder, padding: spacing.md },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.sm },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  doneBadge: { width: 92, height: 92, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  grewRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: spacing.xl },
  grewChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  footer2: {},
});
