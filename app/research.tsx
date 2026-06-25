import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Switch, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { ModalHeader } from '../src/components/ModalHeader';
import { GradientButton } from '../src/components/GradientButton';
import { Display, Body, Muted, Label, GlassCard, Serif, Row, Title } from '../src/components/ui';
import { useApp } from '../src/context/AppContext';
import { SCREENERS, severity, type Screener, type ScreenerResult } from '../src/lib/screeners';
import { getItem, KEYS } from '../src/lib/storage';
import { colors, font, radius, spacing } from '../src/theme/theme';
import { tap, success, select } from '../src/lib/haptics';

export default function Research() {
  const { screeners, researchConsent, setResearchConsent, addScreener } = useApp();
  const [active, setActive] = useState<Screener | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<ScreenerResult | null>(null);

  const start = (s: Screener) => {
    select();
    setActive(s);
    setAnswers(new Array(s.items.length).fill(-1));
    setResult(null);
  };

  const submit = () => {
    if (!active) return;
    const score = answers.reduce((a, b) => a + Math.max(0, b), 0);
    const flagged = active.sensitiveItem != null && answers[active.sensitiveItem] > 0;
    const r: ScreenerResult = { id: active.id, score, severity: severity(active, score), at: Date.now(), flagged };
    addScreener(r);
    success();
    setResult(r);
    setActive(null);
  };

  const exportData = async () => {
    tap();
    const [user, baseline, checkins, sessions, journal, scr, side, prefs] = await Promise.all([
      getItem(KEYS.user, null), getItem(KEYS.baseline, null), getItem(KEYS.checkins, []),
      getItem(KEYS.sessions, []), getItem(KEYS.journal, []), getItem(KEYS.screeners, []),
      getItem('sideState', {}), getItem(KEYS.prefs, {}),
    ]);
    const payload = { exportedAt: new Date().toISOString(), app: 'MoodSignal', user, baseline, checkins, sessions, journal, screeners: scr, sideModule: side, prefs };
    try {
      await Share.share({ message: JSON.stringify(payload, null, 2) });
    } catch {
      Alert.alert('Export', 'Could not open the share sheet.');
    }
  };

  const lastOf = (id: 'phq9' | 'gad7') => screeners.find((s) => s.id === id);

  /* --------- Running a screener --------- */
  if (active) {
    const allAnswered = answers.every((a) => a >= 0);
    return (
      <View style={{ flex: 1 }}>
        <AnimatedBackground tint={colors.lavender} />
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <ModalHeader title={active.title} accent={colors.lavender} />
          <Animated.ScrollView entering={FadeIn} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}>
            <Serif style={{ fontSize: 18, lineHeight: 26, marginBottom: spacing.lg }}>{active.lead}</Serif>
            {active.items.map((item, i) => (
              <GlassCard key={i} style={{ marginBottom: spacing.sm, gap: 10 }}>
                <Body color={colors.text} style={{ fontSize: 14.5, lineHeight: 21 }}>{i + 1}. {item}</Body>
                <View style={styles.opts}>
                  {active.options.map((o) => {
                    const on = answers[i] === o.value;
                    return (
                      <Pressable key={o.value} onPress={() => { select(); setAnswers((a) => a.map((x, j) => (j === i ? o.value : x))); }}
                        style={[styles.opt, on && { backgroundColor: colors.lavender, borderColor: colors.lavender }]}>
                        <Body style={{ fontSize: 11, textAlign: 'center', color: on ? colors.black : colors.textMuted }}>{o.label}</Body>
                      </Pressable>
                    );
                  })}
                </View>
              </GlassCard>
            ))}
          </Animated.ScrollView>
          <View style={styles.footer}>
            <GradientButton label="See my score" onPress={submit} disabled={!allAnswered} full />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.lavender} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ModalHeader title="Research & data" accent={colors.lavender} />
        <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 50 }}>
          <Display style={{ fontSize: 26 }}>Outcomes & data</Display>
          <Muted style={{ marginTop: 4, marginBottom: spacing.lg }}>
            Optional check-ins to track how you’re doing over time. For reflection — not a diagnosis.
          </Muted>

          {result && (
            <Animated.View entering={FadeInDown.duration(500)} style={{ marginBottom: spacing.md }}>
              <GlassCard accent={colors.lavender} style={{ gap: 6 }}>
                <Label color={colors.lavender}>{SCREENERS[result.id].title} RESULT</Label>
                <Row gap={10} style={{ alignItems: 'baseline' }}>
                  <Title style={{ fontFamily: font.serif, fontSize: 34 }}>{result.score}</Title>
                  <Body color={colors.text} style={{ fontFamily: font.sansSemibold }}>{result.severity}</Body>
                </Row>
                {result.flagged && (
                  <Body color={colors.coral} style={{ fontSize: 13, lineHeight: 20, marginTop: 4 }}>
                    You noted thoughts of self-harm. You deserve support right now — please reach out to a trusted person or a crisis line (in the US, call or text 988). You are not alone.
                  </Body>
                )}
                <Muted style={{ fontSize: 12, marginTop: 4 }}>Saved to your private trend below.</Muted>
              </GlassCard>
            </Animated.View>
          )}

          {/* Consent */}
          <GlassCard style={{ marginBottom: spacing.md }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 15 }}>Contribute to research</Body>
                <Muted style={{ fontSize: 12.5 }}>Anonymous, opt-in. Nothing is shared without this on. You can export or delete anytime.</Muted>
              </View>
              <Switch value={researchConsent} onValueChange={(v) => { select(); setResearchConsent(v); }} trackColor={{ true: colors.lavender, false: 'rgba(255,255,255,0.15)' }} thumbColor={colors.text} />
            </Row>
          </GlassCard>

          {/* Screeners */}
          <Label style={{ marginBottom: 12 }}>SELF-CHECK</Label>
          <View style={{ gap: spacing.sm }}>
            {(['phq9', 'gad7'] as const).map((id) => {
              const s = SCREENERS[id];
              const last = lastOf(id);
              return (
                <Pressable key={id} onPress={() => start(s)}>
                  <GlassCard style={styles.scrRow}>
                    <View style={[styles.scrIcon, { backgroundColor: colors.lavender + '1a' }]}>
                      <Ionicons name="clipboard-outline" size={18} color={colors.lavender} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 15 }}>{s.title} · {s.subtitle}</Body>
                      <Muted style={{ fontSize: 12.5 }}>{last ? `Last: ${last.score} (${last.severity}) · ${new Date(last.at).toLocaleDateString()}` : 'Not taken yet'}</Muted>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
                  </GlassCard>
                </Pressable>
              );
            })}
          </View>

          {/* Trend */}
          {screeners.length > 0 && (
            <View style={{ marginTop: spacing.xl }}>
              <Label style={{ marginBottom: 12 }}>YOUR HISTORY</Label>
              <GlassCard style={{ gap: spacing.sm }}>
                {screeners.slice(0, 8).map((r, i) => (
                  <Row key={i} style={{ justifyContent: 'space-between' }}>
                    <Muted style={{ fontSize: 13 }}>{SCREENERS[r.id].title} · {new Date(r.at).toLocaleDateString()}</Muted>
                    <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 13.5 }}>{r.score} · {r.severity}</Body>
                  </Row>
                ))}
              </GlassCard>
            </View>
          )}

          {/* Export */}
          <View style={{ marginTop: spacing.xl }}>
            <GradientButton label="Export my data (JSON)" variant="solid" icon={<Ionicons name="download-outline" size={18} color={colors.text} />} onPress={exportData} full />
            <Muted center style={{ marginTop: spacing.md, fontSize: 11.5, lineHeight: 17 }}>
              PHQ-9 and GAD-7 are validated research instruments included for self-reflection and tracking. They do not diagnose. If you’re struggling, please talk to a professional.
            </Muted>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  opts: { flexDirection: 'row', gap: 6 },
  opt: { flex: 1, paddingVertical: 9, paddingHorizontal: 4, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.panelBorder, backgroundColor: colors.surface1, justifyContent: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  scrRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: spacing.md },
  scrIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
