import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard, Serif, Body, Muted, Label } from './ui';
import { colors, font, radius, spacing } from '../theme/theme';
import { TYPE_META, type DailyMessage } from '../data/messages';
import { tap } from '../lib/haptics';

const ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  affirmation: 'sparkles',
  devotional: 'book',
  quote: 'chatbox-ellipses',
  breath: 'leaf',
  grounding: 'footsteps',
  gratitude: 'heart',
  stillness: 'moon',
  resilience: 'flame',
  thought: 'bulb',
};

export function MessageCard({ message, featured }: { message: DailyMessage; featured?: boolean }) {
  const router = useRouter();
  const meta = TYPE_META[message.type];

  const open = () => {
    tap();
    router.push(`/message/${message.id}`);
  };

  if (featured) {
    return (
      <Pressable onPress={open}>
        <View style={[styles.featured, { borderColor: message.accent + '44' }]}>
          <LinearGradient
            colors={[message.accent + '1f', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.featRow}>
            <View style={[styles.iconChip, { backgroundColor: message.accent + '22', borderColor: message.accent + '55' }]}>
              <Ionicons name={ICON[message.type]} size={16} color={message.accent} />
            </View>
            <Label color={message.accent}>{meta.label.toUpperCase()} · DAY {message.id}</Label>
          </View>
          <Serif style={styles.featBody}>{message.body}</Serif>
          {message.author ? <Muted style={{ marginTop: 6 }}>— {message.author}</Muted> : null}
          <View style={styles.featFoot}>
            <Body color={colors.textDim} style={{ fontSize: 13.5 }} numberOfLines={1}>
              {meta.verb}: {message.action}
            </Body>
            <Ionicons name="arrow-forward" size={18} color={message.accent} />
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={open}>
      <GlassCard style={styles.compact}>
        <View style={[styles.iconChip, { backgroundColor: message.accent + '22', borderColor: message.accent + '55' }]}>
          <Ionicons name={ICON[message.type]} size={16} color={message.accent} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Label color={message.accent}>{meta.label.toUpperCase()} · DAY {message.id}</Label>
          <Body color={colors.text} style={{ fontFamily: font.serif, fontSize: 16, lineHeight: 23 }} numberOfLines={3}>
            {message.body}
          </Body>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  featured: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    backgroundColor: colors.panel,
    overflow: 'hidden',
    gap: spacing.md,
  },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featBody: { fontSize: 24, lineHeight: 33 },
  featFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4 },
  iconChip: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  compact: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md },
});
