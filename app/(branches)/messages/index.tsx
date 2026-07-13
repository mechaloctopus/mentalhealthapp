import { ScrollView, View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MESSAGES, todaysMessage, TYPE_META } from '../../../src/content/messages';
import { GlassCard } from '../../../src/components/GlassCard';
import { colors, font, spacing } from '../../../src/theme/tokens';

export default function MessagesIndex() {
  const today = todaysMessage();

  const recent = MESSAGES.slice(0, 14);

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Dashboard</Text>
        </Pressable>
        <Text style={styles.title}>Daily Messages</Text>
        <Text style={styles.sub}>A different message every day of the year.</Text>

        <GlassCard strong style={styles.todayCard}>
          <Text style={[styles.todayType, { color: today.accent }]}>{TYPE_META[today.type].label.toUpperCase()}</Text>
          <Text style={styles.todayTitle}>{today.title}</Text>
          <Text style={styles.todayBody}>{today.body}</Text>
          {today.author && <Text style={styles.todayAuthor}>— {today.author}</Text>}
          <View style={styles.divider} />
          <Text style={styles.actionLabel}>{TYPE_META[today.type].verb}</Text>
          <Text style={styles.todayAction}>{today.action}</Text>
        </GlassCard>

        <Text style={styles.sectionTitle}>Coming up</Text>
        <View style={styles.list}>
          {recent.slice(1, 8).map((msg) => (
            <GlassCard key={msg.id} style={styles.msgCard}>
              <Text style={[styles.msgType, { color: msg.accent }]}>{TYPE_META[msg.type].label}</Text>
              <Text style={styles.msgTitle}>{msg.title}</Text>
              <Text style={styles.msgBody} numberOfLines={2}>{msg.body}</Text>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
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
  todayCard: { padding: spacing.xl, gap: spacing.sm },
  todayType: { fontFamily: font.sansSemibold, fontSize: 10, letterSpacing: 1.5 },
  todayTitle: { fontFamily: font.display, fontSize: 22, color: colors.text },
  todayBody: { fontFamily: font.serif, fontSize: 16, color: colors.text, lineHeight: 26 },
  todayAuthor: { fontFamily: font.serif, fontSize: 13, color: colors.textFaint, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: colors.hairline, marginVertical: spacing.sm },
  actionLabel: { fontFamily: font.sansSemibold, fontSize: 10, color: colors.textFaint, letterSpacing: 1.2 },
  todayAction: { fontFamily: font.serifBold, fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  sectionTitle: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.textFaint, letterSpacing: 1.2, textTransform: 'uppercase' },
  list: { gap: spacing.sm },
  msgCard: { padding: spacing.lg, gap: spacing.xs },
  msgType: { fontFamily: font.sansSemibold, fontSize: 10, letterSpacing: 1 },
  msgTitle: { fontFamily: font.sansBold, fontSize: 14, color: colors.text },
  msgBody: { fontFamily: font.serif, fontSize: 13, color: colors.textFaint, lineHeight: 20 },
});
