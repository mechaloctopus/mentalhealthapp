import { ScrollView, Text, StyleSheet, SafeAreaView, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../src/components/GlassCard';
import { colors, font, spacing } from '../src/theme/tokens';

const SECTIONS = [
  {
    icon: '◉',
    title: 'Your data never leaves your device',
    body: 'All check-ins, journal entries, and emotional signals are stored locally in an encrypted database on your phone. Nothing is transmitted to any server — not Anthropic, not any third party, not us.',
  },
  {
    icon: '♫',
    title: 'Audio is never stored',
    body: 'Voice check-ins are processed entirely on-device in real time. The audio itself is discarded the moment analysis is complete. We do not record, retain, or transmit your voice.',
  },
  {
    icon: '◈',
    title: 'No accounts, no tracking',
    body: 'MoodSignal does not require an account. There are no analytics SDKs, no crash reporters that send data externally, and no advertising identifiers.',
  },
  {
    icon: '⊙',
    title: 'Notifications stay local',
    body: 'Daily reminder notifications are scheduled on-device by iOS/Android. We do not use push notification servers.',
  },
  {
    icon: '✦',
    title: 'Deleting your data',
    body: 'Uninstalling MoodSignal removes all data permanently — there is no cloud backup to delete separately. You can also reset check-in history from the Settings row in the You tab.',
  },
];

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Privacy & Data</Text>
          <Text style={styles.intro}>
            The short version: your emotional data is private, local, and yours alone. Here's exactly what that means.
          </Text>
        </View>

        {SECTIONS.map((s) => (
          <GlassCard key={s.title} style={styles.card}>
            <View style={styles.iconRow}>
              <Text style={styles.icon}>{s.icon}</Text>
              <Text style={styles.cardTitle}>{s.title}</Text>
            </View>
            <Text style={styles.cardBody}>{s.body}</Text>
          </GlassCard>
        ))}

        <GlassCard style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Not a medical device</Text>
          <Text style={styles.noticeBody}>
            MoodSignal is a personal wellness tool, not a medical device and not a substitute for professional mental health care.
            The emotional signals it produces are estimates based on acoustic patterns — they are not diagnoses.{'\n\n'}
            If you are in crisis, please use the{' '}
            <Text style={styles.noticeLink} onPress={() => router.push('/crisis' as any)}>
              Crisis Resources
            </Text>{' '}
            screen.
          </Text>
        </GlassCard>

        <Text style={styles.footer}>
          Last updated: July 2025 · Version 2.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  back: { paddingTop: spacing.lg },
  backText: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.teal },

  header: { gap: spacing.sm, paddingVertical: spacing.md },
  title: { fontFamily: font.display, fontSize: 28, color: colors.text },
  intro: { fontFamily: font.serif, fontSize: 15, color: colors.textMuted, lineHeight: 24 },

  card: { padding: spacing.lg, gap: spacing.sm },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { fontSize: 18, color: colors.teal, width: 24, textAlign: 'center' },
  cardTitle: { fontFamily: font.sansBold, fontSize: 14, color: colors.text, flex: 1 },
  cardBody: { fontFamily: font.serif, fontSize: 13, color: colors.textMuted, lineHeight: 22 },

  noticeCard: { padding: spacing.xl, gap: spacing.sm },
  noticeTitle: { fontFamily: font.sansBold, fontSize: 14, color: colors.amber },
  noticeBody: { fontFamily: font.serif, fontSize: 13, color: colors.textMuted, lineHeight: 22 },
  noticeLink: { color: colors.teal, fontFamily: font.sansSemibold },

  footer: { fontFamily: font.sans, fontSize: 11, color: colors.textFaint, textAlign: 'center' },
});
