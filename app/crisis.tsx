import { ScrollView, Text, StyleSheet, SafeAreaView, Pressable, View, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../src/components/GlassCard';
import { colors, font, spacing } from '../src/theme/tokens';

const RESOURCES = [
  {
    label: '988 Suicide & Crisis Lifeline',
    sub: 'Call or text anytime, 24/7',
    action: 'Call 988',
    uri: 'tel:988',
    color: colors.coral,
    primary: true,
  },
  {
    label: 'Crisis Text Line',
    sub: 'Text HOME to 741741',
    action: 'Open Messages',
    uri: 'sms:741741&body=HOME',
    color: colors.teal,
    primary: false,
  },
  {
    label: 'SAMHSA Helpline',
    sub: '1-800-662-4357 · Mental health & substance use',
    action: 'Call now',
    uri: 'tel:18006624357',
    color: colors.lavender,
    primary: false,
  },
  {
    label: 'NAMI Helpline',
    sub: '1-800-950-6264 · M–F 10am–10pm ET',
    action: 'Call now',
    uri: 'tel:18009506264',
    color: colors.blue,
    primary: false,
  },
];

async function open(uri: string) {
  try {
    const ok = await Linking.canOpenURL(uri);
    if (ok) {
      await Linking.openURL(uri);
    } else {
      Alert.alert('Could not open', 'Please dial manually.');
    }
  } catch {
    Alert.alert('Could not open', 'Please dial manually.');
  }
}

export default function CrisisScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.glyph}>♡</Text>
          <Text style={styles.title}>You are not alone</Text>
          <Text style={styles.intro}>
            If you're struggling right now, reaching out is the right move. These services are free,
            confidential, and available 24 hours a day.
          </Text>
        </View>

        {RESOURCES.map((r) => (
          <GlassCard key={r.label} strong={r.primary} style={[styles.card, r.primary && styles.cardPrimary]}>
            {r.primary && (
              <LinearGradient
                colors={['rgba(239,120,108,0.16)', 'rgba(239,120,108,0.04)']}
                style={StyleSheet.absoluteFill}
              />
            )}
            <View style={styles.cardBody}>
              <Text style={[styles.cardLabel, { color: r.color }]}>{r.label}</Text>
              <Text style={styles.cardSub}>{r.sub}</Text>
            </View>
            <Pressable
              onPress={() => open(r.uri)}
              style={[styles.callBtn, { borderColor: r.color }]}
            >
              <Text style={[styles.callBtnText, { color: r.color }]}>{r.action}</Text>
            </Pressable>
          </GlassCard>
        ))}

        <GlassCard style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>In immediate danger?</Text>
          <Text style={styles.emergencySub}>
            Call <Text style={styles.emergencyNum}>911</Text> or your local emergency number.
          </Text>
        </GlassCard>

        <GlassCard style={styles.intlCard}>
          <Text style={styles.intlTitle}>Outside the US?</Text>
          <Text style={styles.intlSub}>
            Visit <Text style={styles.intlLink} onPress={() => Linking.openURL('https://findahelpline.com')}>findahelpline.com</Text> for
            crisis centres in over 50 countries.
          </Text>
        </GlassCard>

        <Text style={styles.disclaimer}>
          MoodSignal monitors trends, not live wellbeing. It is not a substitute for professional mental health support.
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

  header: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  glyph: { fontSize: 36, color: colors.coral },
  title: { fontFamily: font.display, fontSize: 28, color: colors.text, textAlign: 'center' },
  intro: { fontFamily: font.serif, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 24 },

  card: { padding: spacing.lg, gap: spacing.sm, overflow: 'hidden' },
  cardPrimary: { paddingVertical: spacing.xl },
  cardBody: { gap: 4 },
  cardLabel: { fontFamily: font.sansBold, fontSize: 15 },
  cardSub: { fontFamily: font.serif, fontSize: 13, color: colors.textFaint, lineHeight: 20 },
  callBtn: {
    borderWidth: 1, borderRadius: 20,
    paddingVertical: 10, paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start', marginTop: spacing.xs,
  },
  callBtnText: { fontFamily: font.sansSemibold, fontSize: 13 },

  emergencyCard: { padding: spacing.xl, gap: spacing.xs },
  emergencyTitle: { fontFamily: font.sansBold, fontSize: 14, color: colors.text },
  emergencySub: { fontFamily: font.serif, fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  emergencyNum: { fontFamily: font.sansBold, color: colors.coral },

  intlCard: { padding: spacing.xl, gap: spacing.xs },
  intlTitle: { fontFamily: font.sansBold, fontSize: 14, color: colors.text },
  intlSub: { fontFamily: font.serif, fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  intlLink: { color: colors.teal, fontFamily: font.sansSemibold },

  disclaimer: {
    fontFamily: font.sans, fontSize: 11, color: colors.textFaint,
    textAlign: 'center', lineHeight: 18, paddingHorizontal: spacing.md,
  },
});
