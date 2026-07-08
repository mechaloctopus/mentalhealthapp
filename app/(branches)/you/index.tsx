import { ScrollView, View, Text, StyleSheet, SafeAreaView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../../src/store';
import { signOut } from '../../../src/lib/auth';
import { cancelReminders, scheduleDaily } from '../../../src/lib/notifications';
import { GlassCard } from '../../../src/components/GlassCard';
import { GradientButton } from '../../../src/components/GradientButton';
import { colors, font, spacing } from '../../../src/theme/tokens';

export default function YouIndex() {
  const user = useStore((s) => s.user);
  const recentCheckIns = useStore((s) => s.recentCheckIns);
  const reminderHour = useStore((s) => s.reminderHour);
  const setUser = useStore((s) => s.setUser);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const setReminderHour = useStore((s) => s.setReminderHour);

  async function handleSignOut() {
    Alert.alert('Reset app', 'This will clear your session. Local data remains.', [
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

  async function toggleReminder() {
    if (reminderHour !== null) {
      await cancelReminders();
      setReminderHour(null);
    } else {
      await scheduleDaily(8);
      setReminderHour(8);
    }
  }

  const totalCheckIns = recentCheckIns.length;

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Dashboard</Text>
        </Pressable>
        <Text style={styles.title}>You</Text>

        <GlassCard style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{user?.displayName?.[0] ?? 'Y'}</Text>
          </View>
          <Text style={styles.displayName}>{user?.displayName ?? 'You'}</Text>
          <Text style={styles.dataNote}>Your data lives on this device.</Text>
        </GlassCard>

        <View style={styles.statsRow}>
          <StatBox label="Check-ins logged" value={totalCheckIns} />
          <StatBox label="Entries written" value={0} />
        </View>

        <GlassCard style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Settings</Text>

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
        </GlassCard>

        <GlassCard style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>About</Text>
          <Text style={styles.aboutText}>MoodSignal v2</Text>
          <Text style={styles.aboutSub}>
            Built on Russell's circumplex model. Voice analysis runs entirely on-device.
            No data leaves your phone without your explicit consent.
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

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <GlassCard style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
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
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  back: { paddingTop: spacing.lg },
  backText: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.teal },
  title: { fontFamily: font.display, fontSize: 28, color: colors.text },
  profile: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.surface3,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { fontFamily: font.displayBold, fontSize: 28, color: colors.text },
  displayName: { fontFamily: font.display, fontSize: 20, color: colors.text },
  dataNote: { fontFamily: font.sans, fontSize: 12, color: colors.textFaint },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statBox: { flex: 1, padding: spacing.lg, gap: spacing.xs },
  statValue: { fontFamily: font.displayBold, fontSize: 24, color: colors.text },
  statLabel: { fontFamily: font.sans, fontSize: 11, color: colors.textFaint },
  settingsCard: { padding: spacing.xl, gap: spacing.md },
  settingsTitle: { fontFamily: font.sansBold, fontSize: 13, color: colors.textFaint, letterSpacing: 0.5, textTransform: 'uppercase' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingText: { flex: 1, gap: 2 },
  settingLabel: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.text },
  settingDesc: { fontFamily: font.sans, fontSize: 12, color: colors.textFaint },
  settingToggle: { fontFamily: font.sansBold, fontSize: 12, color: colors.textFaint },
  settingOn: { color: colors.teal },
  aboutText: { fontFamily: font.sansSemibold, fontSize: 14, color: colors.text },
  aboutSub: { fontFamily: font.serif, fontSize: 13, color: colors.textFaint, lineHeight: 21 },
});
