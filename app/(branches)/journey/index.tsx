import { ScrollView, View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../../src/store';
import { SCHOOLS } from '../../../src/content/schools';
import { GlassCard } from '../../../src/components/GlassCard';
import { PressableCard } from '../../../src/components/PressableCard';
import { GradientButton } from '../../../src/components/GradientButton';
import { colors, font, spacing, gradients } from '../../../src/theme/tokens';

const fiveTemples = SCHOOLS.find((s) => s.id === 'five-temples')!;
const otherPaths = SCHOOLS.filter((s) => s.id !== 'five-temples');

export default function JourneyIndex() {
  const activeSchoolId = useStore((s) => s.activeSchoolId);
  const setActiveSchool = useStore((s) => s.setActiveSchool);

  const activeSchool = activeSchoolId ? SCHOOLS.find((s) => s.id === activeSchoolId) : null;

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[...gradients.canvas]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Dashboard</Text>
        </Pressable>
        <Text style={styles.title}>Journey</Text>
        <Text style={styles.sub}>
          Choose an inner way and follow its daily lessons. Return each day to deepen the practice.
        </Text>

        {/* Active path card */}
        {activeSchool && (
          <GlassCard strong style={styles.activeCard}>
            <Text style={styles.activeLabel}>Your current path</Text>
            <Text style={[styles.activeName, { color: activeSchool.color }]}>{activeSchool.name}</Text>
            <Text style={styles.activeTagline}>{activeSchool.tagline}</Text>
            <Pressable onPress={() => router.push('/(branches)/journey/quest')}>
              <Text style={styles.questLink}>Today's lesson ›</Text>
            </Pressable>
          </GlassCard>
        )}

        {/* Five Temples — primary featured path */}
        <Text style={styles.sectionTitle}>The Primary Path</Text>
        <PressableCard
          onPress={() => {
            setActiveSchool(fiveTemples.id);
            router.push('/(branches)/journey/quest');
          }}
          style={styles.featuredCard}
        >
          <LinearGradient
            colors={['rgba(128,35,123,0.28)', 'rgba(31,50,119,0.18)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.featuredBar, { backgroundColor: fiveTemples.color }]} />
          <View style={styles.featuredText}>
            <Text style={[styles.featuredName, { color: fiveTemples.color }]}>{fiveTemples.name}</Text>
            <Text style={styles.featuredTagline}>{fiveTemples.tagline}</Text>
            <Text style={styles.featuredDesc}>{fiveTemples.description}</Text>
            <View style={styles.virtueRow}>
              {fiveTemples.coreVirtues.map((v) => (
                <Text key={v} style={[styles.virtue, styles.virtueFeatured]}>{v}</Text>
              ))}
            </View>
          </View>
          {activeSchoolId === fiveTemples.id && <Text style={styles.activeCheck}>✓</Text>}
        </PressableCard>

        {/* Other inner ways */}
        <Text style={styles.sectionTitle}>The Inner Ways</Text>
        <View style={styles.schools}>
          {otherPaths.map((school) => (
            <PressableCard
              key={school.id}
              onPress={() => {
                setActiveSchool(school.id);
                router.push('/(branches)/journey/quest');
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

        {!activeSchool && (
          <GradientButton
            label="Begin with The Five Temples"
            variant="flame"
            onPress={() => {
              setActiveSchool(fiveTemples.id);
              router.push('/(branches)/journey/quest');
            }}
          />
        )}
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

  featuredCard: { flexDirection: 'row', alignItems: 'center', overflow: 'hidden', borderRadius: 18 },
  featuredBar: { width: 5, alignSelf: 'stretch' },
  featuredText: { flex: 1, padding: spacing.xl, gap: spacing.xs },
  featuredName: { fontFamily: font.display, fontSize: 20 },
  featuredTagline: { fontFamily: font.serif, fontSize: 14, color: colors.textMuted, fontStyle: 'italic' },
  featuredDesc: { fontFamily: font.serif, fontSize: 13, color: colors.textFaint, lineHeight: 20, marginTop: spacing.xs },
  virtueFeatured: { borderColor: 'rgba(177,95,176,0.30)', borderWidth: 1 },

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
