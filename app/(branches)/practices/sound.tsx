import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../../src/components/GlassCard';
import { colors, font, spacing } from '../../../src/theme/tokens';

const SOUNDSCAPES = [
  { id: 'calming', label: 'Calming', description: 'Low drone, gentle rain, soft tone', emoji: '〜', color: colors.teal },
  { id: 'uplift', label: 'Uplift', description: 'Bright overtones, rising tones', emoji: '↑', color: colors.amber },
  { id: 'warm', label: 'Warm', description: 'Soft harmonic wash, steady pulse', emoji: '♡', color: colors.coral },
  { id: 'focus', label: 'Focus', description: 'Pink noise, minimal beats', emoji: '◎', color: colors.blue },
];

export default function SoundPractice() {
  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Practices</Text>
        </Pressable>
        <Text style={styles.title}>Sound</Text>
        <Text style={styles.sub}>Soundscapes that support your state.</Text>
        <Text style={styles.note}>Sound playback requires headphones for best effect.</Text>

        <View style={styles.list}>
          {SOUNDSCAPES.map((s) => (
            <GlassCard key={s.id} style={styles.card}>
              <Text style={styles.emoji}>{s.emoji}</Text>
              <View style={styles.text}>
                <Text style={[styles.cardLabel, { color: s.color }]}>{s.label}</Text>
                <Text style={styles.cardDesc}>{s.description}</Text>
              </View>
              <Text style={styles.comingSoon}>Coming soon</Text>
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
  sub: { fontFamily: font.serif, fontSize: 15, color: colors.textMuted, lineHeight: 23 },
  note: { fontFamily: font.sans, fontSize: 12, color: colors.textFaint },
  list: { gap: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  emoji: { fontSize: 28, width: 36 },
  text: { flex: 1, gap: 3 },
  cardLabel: { fontFamily: font.sansSemibold, fontSize: 15 },
  cardDesc: { fontFamily: font.sans, fontSize: 13, color: colors.textFaint, lineHeight: 19 },
  comingSoon: { fontFamily: font.sans, fontSize: 11, color: colors.textFaint },
});
