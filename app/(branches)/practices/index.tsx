import { ScrollView, View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../../src/components/GlassCard';
import { colors, font, spacing, radius, gradients } from '../../../src/theme/tokens';

const PRACTICES = [
  { id: 'breath', label: 'Breath', description: 'Box breathing, activation, extended exhale', emoji: '💨', color: colors.blue },
  { id: 'stillness', label: 'Stillness', description: 'Body scan, grounding, breath anchor', emoji: '◉', color: colors.teal },
  { id: 'sound', label: 'Sound', description: 'Calming and energizing soundscapes', emoji: '♪', color: colors.lavender },
  { id: 'sleep', label: 'Sleep', description: 'Wind-down practices for rest', emoji: '☽', color: colors.indigo },
  { id: 'loving-kindness', label: 'Loving-Kindness', description: 'Metta — expanding compassion in circles', emoji: '♡', color: colors.coral },
] as const;

export default function PracticesIndex() {
  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[...gradients.canvas]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Dashboard</Text>
        </Pressable>
        <Text style={styles.title}>Practices</Text>
        <Text style={styles.sub}>Guided sessions matched to how you feel.</Text>

        <View style={styles.list}>
          {PRACTICES.map((p) => (
            <Pressable key={p.id} onPress={() => router.push(`/(branches)/practices/${p.id}` as any)}>
              <GlassCard style={styles.card}>
                <Text style={styles.cardEmoji}>{p.emoji}</Text>
                <View style={styles.cardText}>
                  <Text style={[styles.cardLabel, { color: p.color }]}>{p.label}</Text>
                  <Text style={styles.cardDesc}>{p.description}</Text>
                </View>
                <Text style={styles.cardArrow}>›</Text>
              </GlassCard>
            </Pressable>
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
  list: { gap: spacing.sm },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.xl,
  },
  cardEmoji: { fontSize: 28, width: 36 },
  cardText: { flex: 1, gap: 3 },
  cardLabel: { fontFamily: font.sansSemibold, fontSize: 15 },
  cardDesc: { fontFamily: font.sans, fontSize: 13, color: colors.textFaint, lineHeight: 19 },
  cardArrow: { fontSize: 20, color: colors.textFaint },
});
