import { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { setOnboarded as markOnboarded, isOnboarded } from '../src/lib/auth';
import { requestPermission, scheduleDaily } from '../src/lib/notifications';
import { useStore } from '../src/store';
import { GradientButton } from '../src/components/GradientButton';
import { colors, font, radius, spacing } from '../src/theme/tokens';

const STEPS = ['welcome', 'how', 'notifications', 'done'] as const;
type Step = (typeof STEPS)[number];

export default function Onboarding() {
  const [step, setStep] = useState<Step>('welcome');
  const [reminderHour, setReminderHour] = useState(8);
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const setStoreReminderHour = useStore((s) => s.setReminderHour);

  const next = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]!);
  };

  async function handleNotifications(enable: boolean) {
    if (enable) {
      const granted = await requestPermission();
      setNotifGranted(granted);
      if (granted) {
        await scheduleDaily(reminderHour);
        setStoreReminderHour(reminderHour);
      }
    } else {
      setNotifGranted(false);
    }
    next();
  }

  async function handleFinish() {
    await markOnboarded();
    setOnboarded(true);
    router.replace('/(tabs)/');
  }

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0b0e0d', '#090b0b']} style={StyleSheet.absoluteFill} />

      <View style={styles.indicator}>
        {STEPS.map((s, i) => (
          <View
            key={s}
            style={[styles.dot, STEPS.indexOf(step) >= i && styles.dotActive]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        {step === 'welcome' && (
          <StepView
            title="Welcome to MoodSignal"
            body="Each day starts with a brief check-in — your voice or a simple tap — that tells the app how you're doing. The rest follows from there."
            action={<GradientButton label="Next" onPress={next} />}
          />
        )}

        {step === 'how' && (
          <StepView
            title="How it works"
            body="Speak a few sentences into the mic. MoodSignal reads the energy and rhythm in your voice to estimate your mood — entirely on your device, never sent anywhere."
            body2="Or skip voice and tap how you feel. Both work."
            action={<GradientButton label="Got it" onPress={next} />}
          />
        )}

        {step === 'notifications' && (
          <StepView
            title="Daily reminder?"
            body="A gentle nudge each morning helps build the habit. You can change or cancel this any time in Settings."
            action={
              <View style={styles.notifActions}>
                <GradientButton label="Yes, remind me" onPress={() => handleNotifications(true)} />
                <GradientButton label="Skip for now" variant="ghost" onPress={() => handleNotifications(false)} />
              </View>
            }
          />
        )}

        {step === 'done' && (
          <StepView
            title="You're all set"
            body="Check in each morning, explore your patterns, and let the practices meet you where you are."
            action={<GradientButton label="Start" onPress={handleFinish} />}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StepView({
  title, body, body2, action,
}: { title: string; body: string; body2?: string; action: React.ReactNode }) {
  return (
    <View style={styles.step}>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        {body2 && <Text style={[styles.body, { marginTop: spacing.sm }]}>{body2}</Text>}
      </View>
      <View style={styles.actionWrap}>{action}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  indicator: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingTop: spacing.xl,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface3,
  },
  dotActive: { backgroundColor: colors.teal },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl },
  step: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: spacing.xxl * 1.5,
    paddingBottom: spacing.xxl,
  },
  text: { gap: spacing.lg },
  title: {
    fontFamily: font.display,
    fontSize: 30,
    color: colors.text,
    letterSpacing: 0.3,
  },
  body: {
    fontFamily: font.serif,
    fontSize: 17,
    color: colors.textMuted,
    lineHeight: 27,
  },
  actionWrap: { gap: spacing.md },
  notifActions: { gap: spacing.sm },
});
