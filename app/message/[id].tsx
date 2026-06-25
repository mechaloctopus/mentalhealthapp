import React from 'react';
import { View, StyleSheet, Pressable, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../../src/components/AnimatedBackground';
import { Display, Body, Muted, Label, Serif, GlassCard } from '../../src/components/ui';
import { GradientButton } from '../../src/components/GradientButton';
import { useApp } from '../../src/context/AppContext';
import { getMessageById, todaysMessage, TYPE_META } from '../../src/data/messages';
import { colors, font, radius, spacing } from '../../src/theme/theme';
import { tap, success } from '../../src/lib/haptics';

export default function MessageViewport() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { saved, toggleSaved } = useApp();

  const message = getMessageById(Number(id)) ?? todaysMessage();
  const meta = TYPE_META[message.type];
  const isSaved = saved.includes(message.id);

  const onSave = () => {
    if (!isSaved) success(); else tap();
    toggleSaved(message.id);
  };

  const onShare = async () => {
    tap();
    const author = message.author ? `\n— ${message.author}` : '';
    await Share.share({ message: `${message.body}${author}\n\nvia MoodSignal` }).catch(() => {});
  };

  const close = () => {
    tap();
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={message.accent} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable onPress={close} hitSlop={12} style={styles.iconBtn}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </Pressable>
          <Label color={message.accent}>{meta.label.toUpperCase()} · DAY {message.id}</Label>
          <Pressable onPress={onSave} hitSlop={12} style={styles.iconBtn}>
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={isSaved ? message.accent : colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <Animated.View entering={FadeIn.duration(700)} style={[styles.glyphHalo, { borderColor: message.accent + '44', backgroundColor: message.accent + '14' }]}>
            <Ionicons name="sparkles" size={28} color={message.accent} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(700)}>
            <Serif center style={styles.quote}>{message.body}</Serif>
            {message.author ? <Muted center style={{ marginTop: spacing.md, fontSize: 15 }}>— {message.author}</Muted> : null}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(280).duration(700)} style={{ width: '100%', marginTop: spacing.xxl }}>
            <GlassCard accent={message.accent} style={{ gap: 6 }}>
              <Label color={message.accent}>{meta.verb.toUpperCase()}</Label>
              <Body color={colors.text} style={{ fontSize: 16, lineHeight: 24 }}>{message.action}</Body>
            </GlassCard>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(380).duration(700)} style={styles.footer}>
          <GradientButton label="Breathe with this" onPress={() => { tap(); router.replace('/breath'); }} full />
          <Pressable onPress={onShare} style={styles.shareRow} hitSlop={8}>
            <Ionicons name="share-outline" size={17} color={colors.textDim} />
            <Muted>Share this reflection</Muted>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  iconBtn: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  glyphHalo: { width: 72, height: 72, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  quote: { fontSize: 32, lineHeight: 42, letterSpacing: -0.4 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.md },
  shareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 6 },
});
