import { ScrollView, View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../../src/store';
import { SCHOOLS } from '../../../src/content/schools';
import { GlassCard } from '../../../src/components/GlassCard';
import { PressableCard } from '../../../src/components/PressableCard';
import { colors, font, spacing } from '../../../src/theme/tokens';

export default function JourneyIndex() {
  const activeSchoolId = useStore((s) => s.activeSchoolId);
  const setActiveSchool = useStore((s) => s.setActiveSchool);

  const activeSchool = activeSchoolId ? SCHOOLS.find((s) => s.id === activeSchoolId) : null;

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Dashboard</Text>
        </Pressable>
        <Text style={styles.title}>Journey</Text>
        <Text style={styles.sub}>
          Choose a school of thought. Explore its lessons and complete quests to build lasting habits.
        </Text>

        {activeSchool && (
          <GlassCard strong style={styles.activeCard}>
            <Text style={styles.activeLabel}>Current school</Text>
            <Text style={[styles.activeName, { color: activeSchool.color }]}>{activeSchool.name}</Text>
            <Text style={styles.activeTagline}>{activeSchool.tagline}</Text>
            <Pressable onPress={() => router.push('/(branches)/journey/quest')}>
              <Text style={styles.questLink}>Today's quest ›</Text>
            </Pressable>
          </GlassCard>
        )}

        <Text style={styles.sectionTitle}>Schools of Thought</Text>
        <View style={styles.schools}>
          {SCHOOLS.map((school) => (
            <PressableCard
              key={school.id}
              onPress={() => {
                setActiveSchool(school.id);
                router.push(`/(branches)/journey/school/${school.id}` as any);
              }}
              style={styles.schoolCard}
            >
              <View style={[styles.schoolBar, { backgroundColor: school.color }]} />
              <View style={styles.schoolText}>
                <Text style={[styles.schoolName, { color: school.color }]}>{school.name}</Text>
                <Text style={styles.schoolTagline}>{school.tagline}</Text>
                <View style={styles.virtueRow}>
                  {school.coreVirtues.slice(0, 3).map((v) => (
                    <Text key={v} style={styles.virtue}>{v}</Text>
                  ))}
                </View>
              </View>
              {activeSchoolId === school.id && <Text style={styles.activeCheck}>✓</Text>}
            </PressableCard>
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
  activeCard: { padding: spacing.xl, gap: spacing.xs },
  activeLabel: { fontFamily: font.sansSemibold, fontSize: 10, color: colors.textFaint, letterSpacing: 1.2, textTransform: 'uppercase' },
  activeName: { fontFamily: font.display, fontSize: 22 },
  activeTagline: { fontFamily: font.serif, fontSize: 14, color: colors.textMuted },
  questLink: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.amber, marginTop: spacing.sm },
  sectionTitle: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.textFaint, letterSpacing: 1.2, textTransform: 'uppercase' },
  schools: { gap: spacing.sm },
  schoolCard: { flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  schoolBar: { width: 4, alignSelf: 'stretch' },
  schoolText: { flex: 1, padding: spacing.xl, gap: spacing.xs },
  schoolName: { fontFamily: font.sansBold, fontSize: 15 },
  schoolTagline: { fontFamily: font.serif, fontSize: 13, color: colors.textFaint },
  virtueRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs, flexWrap: 'wrap' },
  virtue: {
    fontFamily: font.sans, fontSize: 10, color: colors.textFaint,
    backgroundColor: colors.surface2, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  activeCheck: { fontSize: 18, color: colors.teal, paddingRight: spacing.lg },
});
