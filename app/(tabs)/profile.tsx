import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen, Display, Title, Body, Muted, Label, GlassCard, Serif, Divider, Row } from '../../src/components/ui';
import { useApp } from '../../src/context/AppContext';
import { initials } from '../../src/lib/auth';
import { pendingCount, sendPreview } from '../../src/lib/notifications';
import { colors, font, radius, spacing } from '../../src/theme/theme';
import { tap, select } from '../../src/lib/haptics';

const TIMES = [
  { label: 'Morning', sub: '7:00', hour: 7, minute: 0 },
  { label: 'Mid-morning', sub: '9:00', hour: 9, minute: 0 },
  { label: 'Noon', sub: '12:00', hour: 12, minute: 0 },
  { label: 'Evening', sub: '20:00', hour: 20, minute: 0 },
];

export default function Profile() {
  const router = useRouter();
  const { user, prefs, checkins, sessions, saved, updateNotifPrefs, setHaptics, signOut, resetAll } = useApp();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    pendingCount().then(setPending).catch(() => {});
  }, [prefs.notif]);

  const onSignOut = () => {
    Alert.alert('Sign out?', 'Your data stays on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/sign-in'); } },
    ]);
  };

  const onReset = () => {
    Alert.alert('Reset all data?', 'This clears your baseline, check-ins, sessions, and saved words on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => { await resetAll(); router.replace('/onboarding'); } },
    ]);
  };

  const totalMinutes = sessions.reduce((a, s) => a + s.minutes, 0);

  return (
    <Screen tint={colors.lavender}>
      <View style={styles.header}>
        <Display style={{ fontSize: 32 }}>You</Display>
      </View>

      {/* Profile card */}
      <Animated.View entering={FadeInDown.duration(500)}>
        <GlassCard style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: (user?.avatarColor ?? colors.teal) + '33', borderColor: (user?.avatarColor ?? colors.teal) + '88' }]}>
            <Title style={{ fontSize: 22, color: user?.avatarColor ?? colors.teal }}>{initials(user?.name ?? 'Friend')}</Title>
          </View>
          <View style={{ flex: 1 }}>
            <Serif style={{ fontSize: 21 }}>{user?.name ?? 'Friend'}</Serif>
            <Muted>{user?.email ?? (user?.provider === 'anonymous' ? 'Anonymous session' : '—')}</Muted>
          </View>
          {user?.provider === 'google' ? (
            <View style={styles.providerChip}><Ionicons name="logo-google" size={14} color={colors.textMuted} /></View>
          ) : null}
        </GlassCard>
      </Animated.View>

      {/* Stats */}
      <Animated.View entering={FadeInDown.delay(60).duration(500)} style={{ marginTop: spacing.md }}>
        <GlassCard>
          <Row style={{ justifyContent: 'space-around' }}>
            <Stat value={checkins.length} label="Check-ins" color={colors.teal} />
            <View style={styles.vline} />
            <Stat value={totalMinutes} label="Minutes" color={colors.amber} />
            <View style={styles.vline} />
            <Stat value={saved.length} label="Saved" color={colors.coral} />
          </Row>
        </GlassCard>
      </Animated.View>

      {/* Notifications */}
      <Animated.View entering={FadeInDown.delay(120).duration(500)} style={{ marginTop: spacing.xl }}>
        <Label style={{ marginBottom: 12 }}>DAILY AFFIRMATIONS</Label>
        <GlassCard>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 15 }}>Daily notification</Body>
              <Muted style={{ fontSize: 12.5 }}>A thoughtful word, delivered each day.</Muted>
            </View>
            <Switch
              value={prefs.notif.enabled}
              onValueChange={(v) => { select(); updateNotifPrefs({ enabled: v }); }}
              trackColor={{ true: colors.teal, false: 'rgba(255,255,255,0.15)' }}
              thumbColor={colors.text}
            />
          </Row>

          {prefs.notif.enabled && (
            <>
              <Divider />
              <Muted style={{ marginBottom: 10 }}>Delivery time</Muted>
              <View style={styles.timeRow}>
                {TIMES.map((t) => {
                  const on = prefs.notif.hour === t.hour && prefs.notif.minute === t.minute;
                  return (
                    <Pressable
                      key={t.label}
                      onPress={() => { select(); updateNotifPrefs({ hour: t.hour, minute: t.minute }); }}
                      style={[styles.timeChip, on && { backgroundColor: colors.teal, borderColor: colors.teal }]}
                    >
                      <Body style={{ fontFamily: font.sansSemibold, fontSize: 12.5, color: on ? colors.black : colors.textMuted }}>{t.sub}</Body>
                      <Muted style={{ fontSize: 10, color: on ? colors.black : colors.textDim }}>{t.label}</Muted>
                    </Pressable>
                  );
                })}
              </View>
              <Divider />
              <Row style={{ justifyContent: 'space-between' }}>
                <Muted>{pending} reminders scheduled</Muted>
                <Pressable onPress={() => { tap(); sendPreview(); }} hitSlop={8}>
                  <Body color={colors.teal} style={{ fontFamily: font.sansSemibold, fontSize: 13.5 }}>Send a preview →</Body>
                </Pressable>
              </Row>
            </>
          )}
        </GlassCard>
      </Animated.View>

      {/* Preferences */}
      <Animated.View entering={FadeInDown.delay(180).duration(500)} style={{ marginTop: spacing.xl }}>
        <Label style={{ marginBottom: 12 }}>PREFERENCES</Label>
        <GlassCard>
          <Row style={{ justifyContent: 'space-between' }}>
            <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 15 }}>Haptic feedback</Body>
            <Switch
              value={prefs.hapticsOn}
              onValueChange={(v) => { setHaptics(v); }}
              trackColor={{ true: colors.teal, false: 'rgba(255,255,255,0.15)' }}
              thumbColor={colors.text}
            />
          </Row>
        </GlassCard>
      </Animated.View>

      {/* About / actions */}
      <Animated.View entering={FadeInDown.delay(240).duration(500)} style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        <ActionRow icon="clipboard-outline" label="Research & data · screeners, export" color={colors.lavender} onPress={() => { tap(); router.push('/research'); }} />
        <ActionRow icon="refresh-outline" label="Re-take voice baseline" color={colors.teal} onPress={() => { tap(); router.push('/baseline'); }} />
        <ActionRow icon="log-out-outline" label="Sign out" color={colors.amber} onPress={onSignOut} />
        <ActionRow icon="trash-outline" label="Reset all data" color={colors.coral} onPress={onReset} />
      </Animated.View>

      <Muted center style={styles.about}>
        MoodSignal · A Mended Light app. Research-informed emotional calibration — a wellness and self-reflection aid, not a medical device, and not a substitute for professional care. Voice analysis happens on-device.
      </Muted>
    </Screen>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Title style={{ fontFamily: font.serif, fontSize: 26, color }}>{value}</Title>
      <Muted style={{ fontSize: 12 }}>{label}</Muted>
    </View>
  );
}

function ActionRow({ icon, label, color, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <GlassCard style={styles.actionRow}>
        <View style={[styles.actionIcon, { backgroundColor: color + '1a' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Body color={colors.text} style={{ flex: 1, fontFamily: font.sansMedium, fontSize: 15 }}>{label}</Body>
        <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xs, marginBottom: spacing.lg },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 58, height: 58, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  providerChip: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  vline: { width: 1, height: 36, backgroundColor: colors.panelBorder },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1, borderColor: colors.panelBorder, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: spacing.md },
  actionIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  about: { marginTop: spacing.xl, fontSize: 11.5, lineHeight: 18 },
});
