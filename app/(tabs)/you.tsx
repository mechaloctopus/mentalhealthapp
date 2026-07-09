import { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../src/store';
import { MILESTONES } from '../../src/lib/milestones';
import { signOut } from '../../src/lib/auth';
import { cancelReminders, scheduleDaily } from '../../src/lib/notifications';
import { getTotalCheckInsCount } from '../../src/db';
import { GlassCard } from '../../src/components/GlassCard';
import { GradientButton } from '../../src/components/GradientButton';
import { colors, font, spacing, gradients } from '../../src/theme/tokens';

const REMINDER_TIMES = [
  { label: '7 am',  hour: 7  },
  { label: '8 am',  hour: 8  },
  { label: '9 am',  hour: 9  },
  { label: '12 pm', hour: 12 },
  { label: '6 pm',  hour: 18 },
  { label: '9 pm',  hour: 21 },
];

export default function YouTab() {
  const user = useStore((s) => s.user);
  const recentCheckIns = useStore((s) => s.recentCheckIns);
  const recentEntries = useStore((s) => s.recentEntries);
  const totalResonance = useStore((s) => s.totalResonance);
  const earnedMilestoneIds = useStore((s) => s.earnedMilestoneIds);
  const streak = useStore((s) => s.streak);
  const reminderHour = useStore((s) => s.reminderHour);
  const setUser = useStore((s) => s.setUser);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const setReminderHour = useStore((s) => s.setReminderHour);

  const [totalCheckIns, setTotalCheckIns] = useState(recentCheckIns.length);

  useEffect(() => {
    getTotalCheckInsCount().then(setTotalCheckIns).catch(() => {});
  }, [recentCheckIns.length]);

  const earnedMilestones = MILESTONES.filter((m) => earnedMilestoneIds.includes(m.id));

  async function handleSignOut() {
    Alert.alert('Reset app', 'This will clear your session. Your local data remains on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive', onPress: async () => {
          await signOut();
          setUser(null);
          setOnboarded(false);
          router.replace('/sign-in');
        },
      },
    ]);
  }

  async function enableReminder(hour: number) {
    await scheduleDaily(hour);
    setReminderHour(hour);
  }

  async function disableReminder() {
    await cancelReminders();
    setReminderHour(null);
  }

  function toggleReminder() {
    if (reminderHour !== null) {
      disableReminder();
    } else {
      enableReminder(8);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[...gradients.canvas]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>You</Text>

        {/* Resonance badge */}
        <GlassCard strong style={styles.resonanceCard}>
          <LinearGradient
            colors={['rgba(177,95,176,0.20)', 'rgba(84,104,196,0.12)']}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.resonanceLabel}>Total Resonance</Text>
          <Text style={styles.resonanceValue}>{totalResonance.toLocaleString()}</Text>
          <Text style={styles.resonanceUnit}>resonance points</Text>
        </GlassCard>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBox label="Check-ins" value={totalCheckIns} color={colors.teal} />
          <StatBox label="Entries" value={recentEntries.length} color={colors.lavender} />
          <StatBox label="Day streak" value={streak} color={colors.amber} />
        </View>

        {/* Milestones */}
        {earnedMilestones.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Milestones earned</Text>
            <View style={styles.milestoneList}>
              {earnedMilestones.map((m) => (
                <GlassCard key={m.id} style={styles.milestoneCard}>
                  <Text style={styles.milestoneGlyph}>✦</Text>
                  <View style={styles.milestoneText}>
                    <Text style={styles.milestoneName}>{m.title}</Text>
                    <Text style={styles.milestoneDesc}>{m.desc}</Text>
                  </View>
                  <Text style={styles.milestoneResonance}>+{m.resonance}</Text>
                </GlassCard>
              ))}
            </View>
          </>
        )}

        {earnedMilestones.length === 0 && (
          <GlassCard style={styles.milestoneTease}>
            <Text style={styles.milestoneTeaseText}>
              Complete your first voice check-in to unlock your first milestone.
            </Text>
          </GlassCard>
        )}

        {/* Profile */}
        <GlassCard style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{user?.displayName?.[0] ?? 'Y'}</Text>
          </View>
          <Text style={styles.displayName}>{user?.displayName ?? 'You'}</Text>
          <Text style={styles.dataNote}>Your data lives on this device only.</Text>
        </GlassCard>

        {/* Settings */}
        <GlassCard style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Settings</Text>

          {/* Daily reminder row */}
          <Pressable onPress={toggleReminder} style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Daily reminder</Text>
              <Text style={styles.settingDesc}>
                {reminderHour !== null ? `Set for ${formatHour(reminderHour)}` : 'Off'}
              </Text>
            </View>
            <Text style={[styles.settingToggle, reminderHour !== null && styles.settingOn]}>
              {reminderHour !== null ? 'ON' : 'OFF'}
            </Text>
          </Pressable>

          {/* Time picker pills — shown when reminder is ON */}
          {reminderHour !== null && (
            <View style={styles.timePills}>
              {REMINDER_TIMES.map((t) => (
                <Pressable
                  key={t.hour}
                  onPress={() => enableReminder(t.hour)}
                  style={[styles.timePill, t.hour === reminderHour && styles.timePillActive]}
                >
                  <Text style={[styles.timePillText, t.hour === reminderHour && styles.timePillTextActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </GlassCard>

        {/* Crisis resources */}
        <Pressable onPress={() => router.push('/crisis' as any)}>
          <GlassCard style={styles.crisisCard}>
            <Text style={styles.crisisGlyph}>♡</Text>
            <View style={styles.crisisText}>
              <Text style={styles.crisisLabel}>Crisis resources</Text>
              <Text style={styles.crisisSub}>988, Crisis Text Line, and more</Text>
            </View>
            <Text style={styles.crisisArrow}>›</Text>
          </GlassCard>
        </Pressable>

        {/* Privacy */}
        <Pressable onPress={() => router.push('/privacy' as any)}>
          <GlassCard style={styles.crisisCard}>
            <Text style={[styles.crisisGlyph, { color: colors.teal }]}>◉</Text>
            <View style={styles.crisisText}>
              <Text style={styles.crisisLabel}>Privacy & Data</Text>
              <Text style={styles.crisisSub}>Local-only · no accounts · no tracking</Text>
            </View>
            <Text style={styles.crisisArrow}>›</Text>
          </GlassCard>
        </Pressable>

        {/* About */}
        <GlassCard style={styles.aboutCard}>
          <Text style={styles.settingsTitle}>About MoodSignal</Text>
          <Text style={styles.aboutText}>Version 2.0</Text>
          <Text style={styles.aboutSub}>
            Built on Russell's circumplex model of affect. Voice analysis runs entirely
            on-device using acoustic biomarkers — no audio is ever stored or transmitted.
          </Text>
          <Text style={styles.disclaimer}>
            MoodSignal is a personal wellness tool, not a medical device. It does not provide
            diagnoses and is not a substitute for professional mental health care.
          </Text>
        </GlassCard>

        <GradientButton
          label="Reset session"
          variant="ghost"
          onPress={handleSignOut}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <GlassCard style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </GlassCard>
  );
}

function formatHour(h: number): string {
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${h12}:00 ${ampm}`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  title: { fontFamily: font.display, fontSize: 28, color: colors.text },
  sectionTitle: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.textFaint, letterSpacing: 1.2, textTransform: 'uppercase' },

  resonanceCard: { padding: spacing.xl, alignItems: 'center', gap: spacing.xs, overflow: 'hidden' },
  resonanceLabel: { fontFamily: font.sansSemibold, fontSize: 10, color: colors.textFaint, letterSpacing: 1.2, textTransform: 'uppercase' },
  resonanceValue: { fontFamily: font.displayBold, fontSize: 42, color: colors.violet },
  resonanceUnit: { fontFamily: font.sans, fontSize: 13, color: colors.textFaint },

  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statBox: { flex: 1, padding: spacing.lg, gap: 3, alignItems: 'center' },
  statValue: { fontFamily: font.displayBold, fontSize: 24 },
  statLabel: { fontFamily: font.sans, fontSize: 10, color: colors.textFaint, textAlign: 'center' },

  milestoneList: { gap: spacing.sm },
  milestoneCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  milestoneGlyph: { fontSize: 18, color: colors.amber },
  milestoneText: { flex: 1, gap: 2 },
  milestoneName: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.text },
  milestoneDesc: { fontFamily: font.serif, fontSize: 12, color: colors.textFaint, lineHeight: 18 },
  milestoneResonance: { fontFamily: font.sansSemibold, fontSize: 12, color: colors.violet },
  milestoneTease: { padding: spacing.xl },
  milestoneTeaseText: { fontFamily: font.serif, fontSize: 14, color: colors.textFaint, lineHeight: 22 },

  profile: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.surface3,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { fontFamily: font.displayBold, fontSize: 24, color: colors.text },
  displayName: { fontFamily: font.display, fontSize: 18, color: colors.text },
  dataNote: { fontFamily: font.sans, fontSize: 12, color: colors.textFaint },

  settingsCard: { padding: spacing.xl, gap: spacing.md },
  settingsTitle: { fontFamily: font.sansBold, fontSize: 12, color: colors.textFaint, letterSpacing: 0.5, textTransform: 'uppercase' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingText: { flex: 1, gap: 2 },
  settingLabel: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.text },
  settingDesc: { fontFamily: font.sans, fontSize: 12, color: colors.textFaint },
  settingToggle: { fontFamily: font.sansBold, fontSize: 12, color: colors.textFaint },
  settingOn: { color: colors.teal },

  timePills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingTop: spacing.xs },
  timePill: {
    paddingHorizontal: spacing.md, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
    borderColor: colors.panelBorder,
    backgroundColor: colors.surface2,
  },
  timePillActive: { borderColor: colors.teal, backgroundColor: 'rgba(102,224,202,0.12)' },
  timePillText: { fontFamily: font.sansSemibold, fontSize: 12, color: colors.textFaint },
  timePillTextActive: { color: colors.teal },

  crisisCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  crisisGlyph: { fontSize: 20, color: colors.coral },
  crisisText: { flex: 1, gap: 2 },
  crisisLabel: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.text },
  crisisSub: { fontFamily: font.sans, fontSize: 12, color: colors.textFaint },
  crisisArrow: { fontSize: 18, color: colors.textFaint },

  aboutCard: { padding: spacing.xl, gap: spacing.sm },
  aboutText: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.text },
  aboutSub: { fontFamily: font.serif, fontSize: 13, color: colors.textFaint, lineHeight: 21 },
  disclaimer: {
    fontFamily: font.sans, fontSize: 11, color: colors.textFaint,
    lineHeight: 18, paddingTop: spacing.xs,
    borderTopWidth: 1, borderTopColor: colors.panelBorder,
    marginTop: spacing.xs,
  },
});
