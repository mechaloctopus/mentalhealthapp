import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../../src/store';
import { getSchool } from '../../../src/content/schools';
import { getEmotion } from '../../../src/content/emotions';
import { recommend } from '../../../src/engine/recommend';
import { saveQuestCompletion, markLessonSeen } from '../../../src/db';
import { awardResonance } from '../../../src/lib/resonance';
import { GlassCard } from '../../../src/components/GlassCard';
import { GradientButton } from '../../../src/components/GradientButton';
import { colors, font, spacing } from '../../../src/theme/tokens';

export default function QuestScreen() {
  const activeSchoolId = useStore((s) => s.activeSchoolId);
  const todayCheckIn = useStore((s) => s.todayCheckIn);
  const recentCheckIns = useStore((s) => s.recentCheckIns);
  const addQuestCompletion = useStore((s) => s.addQuestCompletion);
  const markLessonSeenLocal = useStore((s) => s.markLessonSeenLocal);

  const [done, setDone] = useState(false);
  const [completing, setCompleting] = useState(false);

  const school = getSchool(activeSchoolId);
  const emotion = todayCheckIn ? getEmotion(todayCheckIn.emotion) : null;
  const rec = todayCheckIn
    ? recommend(todayCheckIn, recentCheckIns.slice(0, 5).map((c) => c.emotion))
    : null;

  const lesson = school.lessons[new Date().getDate() % school.lessons.length]!;

  async function complete() {
    if (completing) return;
    setCompleting(true);
    try {
      addQuestCompletion({ questId: lesson.id, completedAt: Date.now(), emotion: emotion?.id });
      markLessonSeenLocal(school.id, lesson.id);
      await saveQuestCompletion(lesson.id, emotion?.id);
      await markLessonSeen(school.id, lesson.id);
      await awardResonance('QUEST_COMPLETE');
      setDone(true);
    } finally {
      setCompleting(false);
    }
  }

  if (done) {
    return (
      <SafeAreaView style={styles.root}>
        <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
        <View style={styles.doneCenter}>
          <Text style={styles.doneGlyph}>✦</Text>
          <Text style={styles.doneTitle}>Quest complete</Text>
          <Text style={styles.doneSub}>
            Small steps, taken consistently, build the path.
          </Text>
          <Text style={styles.resonanceNote}>+20 Resonance earned</Text>
          <GradientButton label="Back to Journey" onPress={() => router.replace('/(tabs)/journey')} variant="teal" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Journey</Text>
        </Pressable>

        <Text style={styles.schoolName}>{school.name}</Text>
        <Text style={styles.title}>{lesson.title}</Text>

        <GlassCard strong style={styles.lessonCard}>
          <Text style={styles.lessonBody}>{lesson.body}</Text>
        </GlassCard>

        <GlassCard style={styles.actionCard}>
          <Text style={styles.actionLabel}>Your quest</Text>
          <Text style={styles.action}>{lesson.action}</Text>
        </GlassCard>

        {rec && (
          <GlassCard style={styles.recCard}>
            <Text style={styles.recLabel}>Matched practice</Text>
            <Pressable onPress={() => router.push(rec.activity.route as any)} style={styles.recRow}>
              <Text style={styles.recActivity}>{rec.activity.label}</Text>
              <Text style={styles.recArrow}>›</Text>
            </Pressable>
          </GlassCard>
        )}

        <GradientButton
          label={completing ? 'Marking…' : 'Mark complete'}
          onPress={complete}
          disabled={completing}
          variant="teal"
          style={styles.completeBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  back: { paddingTop: spacing.lg },
  backText: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.teal },
  schoolName: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.textFaint, letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { fontFamily: font.display, fontSize: 26, color: colors.text, lineHeight: 34 },
  lessonCard: { padding: spacing.xl },
  lessonBody: { fontFamily: font.serif, fontSize: 16, color: colors.text, lineHeight: 26 },
  actionCard: { padding: spacing.xl, gap: spacing.xs },
  actionLabel: { fontFamily: font.sansSemibold, fontSize: 10, color: colors.amber, letterSpacing: 1.2, textTransform: 'uppercase' },
  action: { fontFamily: font.serifBold, fontSize: 15, color: colors.text, lineHeight: 23 },
  recCard: { padding: spacing.xl, gap: spacing.xs },
  recLabel: { fontFamily: font.sansSemibold, fontSize: 10, color: colors.textFaint, letterSpacing: 1.2, textTransform: 'uppercase' },
  recRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recActivity: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.teal },
  recArrow: { fontSize: 18, color: colors.teal },
  completeBtn: { marginTop: spacing.sm },
  doneCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl, padding: spacing.xxl },
  doneGlyph: { fontSize: 56, color: colors.amber },
  doneTitle: { fontFamily: font.display, fontSize: 28, color: colors.text },
  doneSub: { fontFamily: font.serif, fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 25 },
  resonanceNote: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.violet },
});
