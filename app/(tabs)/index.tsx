import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, SafeAreaView, Alert, Animated, Linking,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { useStore } from '../../src/store';
import { EMOTIONS, getEmotion } from '../../src/content/emotions';
import { todaysMessage } from '../../src/content/messages';
import { analyzeVoice, buildCheckIn, buildSelfCheckIn } from '../../src/engine/voice';
import type { Affect, CheckIn } from '../../src/engine/voice';
import { recommend } from '../../src/engine/recommend';
import { saveCheckIn, saveBaseline } from '../../src/db';
import { awardResonance } from '../../src/lib/resonance';
import { GlassCard } from '../../src/components/GlassCard';
import { GradientButton } from '../../src/components/GradientButton';
import { BrandMark } from '../../src/components/BrandMark';
import { BreathingGuide } from '../../src/components/BreathingGuide';
import { EmotionResults } from '../../src/components/EmotionResults';
import { ResonanceMoment } from '../../src/components/ResonanceMoment';
import { FactorPicker } from '../../src/components/FactorPicker';
import { colors, font, radius, spacing, gradients } from '../../src/theme/tokens';

type CheckInMode =
  | 'idle'
  | 'baseline-breathing'
  | 'voice-ready'
  | 'recording'
  | 'self'
  | 'factors'
  | 'results';


const PRACTICES = [
  { id: 'breath', label: 'Breath', emoji: '≋', color: colors.blue },
  { id: 'stillness', label: 'Stillness', emoji: '◎', color: colors.teal },
  { id: 'sound', label: 'Sound', emoji: '♫', color: colors.lavender },
  { id: 'sleep', label: 'Sleep', emoji: '☽', color: colors.indigo },
  { id: 'loving-kindness', label: 'Metta', emoji: '♡', color: colors.coral },
];

export default function HomeTab() {
  const user = useStore((s) => s.user);
  const todayCheckIn = useStore((s) => s.todayCheckIn);
  const recentCheckIns = useStore((s) => s.recentCheckIns);
  const addCheckIn = useStore((s) => s.addCheckIn);
  const baseline = useStore((s) => s.baseline);
  const setBaseline = useStore((s) => s.setBaseline);
  const totalResonance = useStore((s) => s.totalResonance);
  const streak = useStore((s) => s.streak);

  const [mode, setMode] = useState<CheckInMode>('idle');
  const [isBaselineSession, setIsBaselineSession] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string | undefined>();
  const [starting, setStarting] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [meterSamples, setMeterSamples] = useState<number[]>([]);
  const [recordStart, setRecordStart] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [lastAffect, setLastAffect] = useState<Affect | null>(null);
  const [pendingCheckin, setPendingCheckin] = useState<CheckIn | null>(null);
  const [pendingIsVoice, setPendingIsVoice] = useState(false);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const pulseScale   = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;

  // Recording dot pulse
  useEffect(() => {
    if (mode !== 'recording') {
      pulseScale.setValue(1);
      pulseOpacity.setValue(1);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale,   { toValue: 1.65, duration: 720, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.28, duration: 720, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale,   { toValue: 1.0,  duration: 720, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 1.0,  duration: 720, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [mode]);

  const todayMsg = todaysMessage();
  const needsBaseline = !baseline;
  const hasTodayCheckIn = !!todayCheckIn;
  const currentEmotion = todayCheckIn ? getEmotion(todayCheckIn.emotion) : null;
  const rec = todayCheckIn ? recommend(todayCheckIn) : null;

  function startVoice(forBaseline = false) {
    setIsBaselineSession(forBaseline);
    setMode('voice-ready');
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 80);
  }

  async function startRecording() {
    if (starting) return;
    setStarting(true);
    try {
      const { recording: rec } = await Audio.Recording.createAsync(
        { ...Audio.RecordingOptionsPresets.HIGH_QUALITY, isMeteringEnabled: true },
        (s) => {
          if (s.isRecording && s.metering !== undefined) {
            setMeterSamples((prev) => [...prev, s.metering!]);
          }
        },
        150,
      );
      setRecording(rec);
      setRecordStart(Date.now());
      setMeterSamples([]);
      setMode('recording');
    } catch {
      Alert.alert(
        'Could not start recording',
        'Allow microphone access in Settings and make sure no other app is using the mic.',
        [{ text: 'OK' }, { text: 'Open Settings', onPress: () => Linking.openSettings() }],
      );
    } finally {
      setStarting(false);
    }
  }

  async function stopRecording() {
    if (!recording) return;
    setProcessing(true);
    try {
      await recording.stopAndUnloadAsync();
      const duration = Date.now() - recordStart;
      const affect = analyzeVoice(meterSamples, duration);
      if (!affect) {
        Alert.alert('Too short', 'Speak for at least 5 seconds and try again.');
        setMode('voice-ready');
        return;
      }
      setLastAffect(affect);

      if (isBaselineSession) {
        const b = {
          energy: affect.energy,
          calmness: affect.calmness,
          stability: affect.stability,
          valence: affect.valence,
          arousal: affect.arousal,
          capturedAt: Date.now(),
          voiceFeatures: affect.voiceFeatures,
        };
        await saveBaseline(b);
        setBaseline(b);
        await awardResonance('CHECKIN_BASELINE');
        setMode('results');
        return;
      }

      const checkin = buildCheckIn({ affect, baseline });
      setPendingCheckin(checkin);
      setPendingIsVoice(true);
      setSelectedFactors([]);
      setMode('factors');
    } finally {
      setProcessing(false);
      setRecording(null);
    }
  }

  function confirmSelf() {
    if (!selectedEmotion) return;
    const checkin = buildSelfCheckIn(selectedEmotion);
    setPendingCheckin(checkin);
    setPendingIsVoice(false);
    setSelectedFactors([]);
    setSelectedEmotion(undefined);
    setMode('factors');
  }

  async function confirmFactors() {
    if (!pendingCheckin) return;
    const checkin: CheckIn = selectedFactors.length > 0
      ? { ...pendingCheckin, factors: selectedFactors }
      : pendingCheckin;
    addCheckIn(checkin);
    await saveCheckIn({
      id: checkin.id, at: checkin.at, emotion: checkin.emotion,
      valence: checkin.valence, arousal: checkin.arousal,
      energy: checkin.energy, calmness: checkin.calmness, stability: checkin.stability,
      stress: checkin.stress, confidence: checkin.confidence,
      voice_emotion: checkin.voiceEmotion, self_emotion: checkin.selfEmotion ?? null,
      note: checkin.note ?? null, factors: checkin.factors ?? null,
      source: checkin.source, baseline_shift: checkin.baselineShift,
      voice_features: checkin.voiceFeatures ? JSON.stringify(checkin.voiceFeatures) : null,
    });
    await awardResonance(pendingIsVoice ? 'CHECKIN_VOICE' : 'CHECKIN_SELF');
    setPendingCheckin(null);
    setSelectedFactors([]);
    setMode(pendingIsVoice ? 'results' : 'idle');
  }

  const handleBreathingComplete = useCallback(() => {
    setIsBaselineSession(true);
    setMode('voice-ready');
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 80);
  }, []);

  const handleResultsDismiss = useCallback(() => {
    setMode('idle');
    setLastAffect(null);
    setIsBaselineSession(false);
  }, []);

  function renderCheckin() {
    if (mode === 'results' && lastAffect) {
      return (
        <EmotionResults
          affect={lastAffect}
          baseline={baseline}
          isBaselineResult={isBaselineSession}
          onDismiss={handleResultsDismiss}
        />
      );
    }

    if (mode === 'baseline-breathing') {
      return (
        <GlassCard style={styles.actionCard}>
          <BreathingGuide onComplete={handleBreathingComplete} />
        </GlassCard>
      );
    }

    if (mode === 'voice-ready' || mode === 'recording') {
      const isRecording = mode === 'recording';
      return (
        <GlassCard style={styles.actionCard}>
          <View style={styles.recordRow}>
            {isRecording && (
              <Animated.View style={[styles.recordDot, {
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              }]} />
            )}
            <Text style={styles.actionHeading}>
              {isBaselineSession ? 'Baseline recording' : 'Voice check-in'}
            </Text>
          </View>
          <Text style={styles.actionSub}>
            {isRecording
              ? 'Read the passage below aloud — tap Done when finished.'
              : 'Read the passage below aloud at a natural pace — your voice does the rest.'}
          </Text>
          <View style={styles.promptBox}>
            <Text style={styles.promptText}>
              {isBaselineSession
                ? 'I arrive in this space, fully present. I notice the rhythm of my breath, the quiet of the room, the feeling of being here right now. There is nothing I need to perform or prove. I am simply here, and that is enough.'
                : 'I am here, present in this moment. I notice what I feel and I accept it without judgment. I have what it takes to meet today fully and with care. I breathe, I notice, I arrive in what is true for me right now.'}
            </Text>
          </View>
          {isRecording ? (
            <GradientButton
              label={processing ? 'Analyzing…' : 'Done'}
              variant="teal"
              onPress={stopRecording}
              disabled={processing}
            />
          ) : (
            <>
              <GradientButton
                label={starting ? 'Starting…' : 'Tap to Record'}
                variant="flame"
                disabled={starting}
                onPress={() => void startRecording()}
              />
              <GradientButton label="Cancel" variant="ghost" onPress={() => setMode('idle')} />
            </>
          )}
        </GlassCard>
      );
    }

    if (mode === 'factors' && pendingCheckin) {
      const emotion = getEmotion(pendingCheckin.emotion);
      return (
        <GlassCard style={styles.actionCard}>
          <View style={styles.factorHeader}>
            <View style={[styles.emotionDot, { backgroundColor: emotion.color }]} />
            <Text style={[styles.emotionName, { color: emotion.color, fontSize: 20 }]}>
              {emotion.label}
            </Text>
          </View>
          <Text style={styles.actionHeading}>What shaped this?</Text>
          <Text style={styles.actionSub}>
            Tag what came before. Over time, patterns emerge.
          </Text>
          <FactorPicker
            selected={selectedFactors}
            onToggle={(id) => setSelectedFactors((prev) =>
              prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
            )}
          />
          <GradientButton
            label={selectedFactors.length > 0
              ? `Done · ${selectedFactors.length} tagged`
              : 'Skip for now'}
            variant={selectedFactors.length > 0 ? 'teal' : 'ghost'}
            onPress={confirmFactors}
          />
        </GlassCard>
      );
    }


if (mode === 'self') {
      const selEmotion = selectedEmotion ? getEmotion(selectedEmotion) : null;
      return (
        <GlassCard style={styles.actionCard}>
          <Text style={styles.actionHeading}>What are you feeling?</Text>
          <Text style={styles.selfHint}>Choose the tone that feels closest right now.</Text>
          <View style={styles.emotionGrid}>
            {EMOTIONS.map((e) => {
              const isSel = selectedEmotion === e.id;
              return (
                <Pressable
                  key={e.id}
                  onPress={() => setSelectedEmotion(e.id)}
                  style={[
                    styles.emotionChip,
                    isSel && { borderColor: e.color, backgroundColor: `${e.color}18` },
                  ]}
                >
                  <View style={[styles.chipDot, { backgroundColor: e.color }]} />
                  <Text style={[styles.chipLabel, isSel && { color: e.color }]}>{e.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {selEmotion && (
            <>
              <Text style={styles.chipNuance}>{selEmotion.nuance.slice(0, 3).join('  ·  ')}</Text>
              <GradientButton label="Confirm" variant="flame" onPress={confirmSelf} />
            </>
          )}
          <GradientButton label="Cancel" variant="ghost"
            onPress={() => { setMode('idle'); setSelectedEmotion(undefined); }} />
        </GlassCard>
      );
    }

    if (hasTodayCheckIn) {
      return (
        <GlassCard strong style={styles.checkedCard}>
          <View style={styles.emotionRow}>
            <View style={[styles.emotionDot, { backgroundColor: currentEmotion!.color }]} />
            <Text style={[styles.emotionName, { color: currentEmotion!.color }]}>
              {currentEmotion!.label}
            </Text>
          </View>
          <Text style={styles.emotionBlurb}>{currentEmotion!.blurb}</Text>
          {baseline && (
            <View style={styles.shiftRow}>
              <Text style={styles.shiftLabel}>vs baseline</Text>
              <Text style={[
                styles.shiftValue,
                { color: (todayCheckIn.baselineShift ?? 0) >= 0 ? colors.teal : colors.coral },
              ]}>
                {(todayCheckIn.baselineShift ?? 0) >= 0
                  ? `+${todayCheckIn.baselineShift}`
                  : `${todayCheckIn.baselineShift}`}
              </Text>
            </View>
          )}
          {rec && (
            <Pressable onPress={() => router.push(rec.activity.route as any)} style={styles.recRow}>
              <Text style={styles.recLabel}>{rec.activity.label}</Text>
              <Text style={styles.recArrow}>›</Text>
            </Pressable>
          )}
        </GlassCard>
      );
    }

    if (needsBaseline) {
      return (
        <GlassCard strong style={styles.actionCard}>
          <LinearGradient
            colors={['rgba(128,35,123,0.20)', 'rgba(31,50,119,0.10)']}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.baselineTag}>FIRST CHECK-IN</Text>
          <Text style={styles.actionHeading}>Establish your signal</Text>
          <Text style={styles.actionSub}>
            We'll guide you through four breath cycles to calm the mind, then record your baseline voice signal. Future check-ins are scored against this.
          </Text>
          <GradientButton
            label="Begin settling practice"
            variant="flame"
            onPress={() => setMode('baseline-breathing')}
          />
          <GradientButton
            label="Skip to voice recording"
            variant="ghost"
            onPress={() => startVoice(true)}
          />
        </GlassCard>
      );
    }

    return (
      <GlassCard style={styles.actionCard}>
        <Text style={styles.actionHeading}>How are you feeling?</Text>
        <Text style={styles.actionSub}>Voice analysis reads your energy, calmness, and stress from how you speak.</Text>
        <View style={styles.checkBtns}>
          <GradientButton
            label="🎙  Voice"
            variant="flame"
            onPress={() => startVoice(false)}
            style={{ flex: 1 }}
          />
          <GradientButton
            label="Tap"
            variant="ghost"
            onPress={() => setMode('self')}
            style={{ flex: 1 }}
          />
        </View>
      </GlassCard>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[...gradients.canvas]} style={StyleSheet.absoluteFill} />
      {/* Atmospheric brand glow — very faint violet at top, fades to nothing */}
      <LinearGradient
        colors={['rgba(128,35,123,0.18)', 'rgba(48,133,172,0.06)', 'rgba(0,0,0,0)']}
        style={[StyleSheet.absoluteFill, { height: 340 }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <ResonanceMoment />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <BrandMark size="sm" />
          <View style={styles.resonanceRow}>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>{streak}d</Text>
              </View>
            )}
            <View style={styles.resonanceBadge}>
              <Text style={styles.resonanceValue}>{totalResonance.toLocaleString()}</Text>
              <Text style={styles.resonanceLabel}>resonance</Text>
            </View>
          </View>
        </View>

        {renderCheckin()}

        {mode === 'idle' && (
          <>
            <GlassCard style={styles.messageCard}>
              <Text style={styles.messageType}>{todayMsg.type.toUpperCase()}</Text>
              <Text style={styles.messageTitle}>{todayMsg.title}</Text>
              <Text style={styles.messageBody}>{todayMsg.body}</Text>
              <Text style={styles.messageAction}>{todayMsg.action}</Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>Practices</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.practiceScroll}>
              {PRACTICES.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/practices/${p.id}` as any)}
                  style={styles.practiceTile}
                >
                  <Text style={[styles.practiceEmoji, { color: p.color }]}>{p.emoji}</Text>
                  <Text style={[styles.practiceLabel, { color: p.color }]}>{p.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: spacing.xxl, gap: spacing.lg, paddingHorizontal: spacing.lg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  resonanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakBadge: {
    backgroundColor: `${colors.amber}22`,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${colors.amber}44`,
  },
  streakText: {
    fontFamily: font.sansBold,
    fontSize: 11,
    color: colors.amber,
  },
  resonanceBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: `${colors.violet}18`,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: `${colors.violet}33`,
  },
  resonanceValue: {
    fontFamily: font.sansBold,
    fontSize: 13,
    color: colors.violet,
  },
  resonanceLabel: {
    fontFamily: font.sans,
    fontSize: 9,
    color: colors.textFaint,
    letterSpacing: 0.4,
  },

  actionCard: { padding: spacing.xl, gap: spacing.md, overflow: 'hidden' },
  factorHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  baselineTag: {
    fontFamily: font.sansSemibold, fontSize: 10,
    color: colors.violet, letterSpacing: 1.6,
  },
  actionHeading: { fontFamily: font.display, fontSize: 22, color: colors.text },
  actionSub: {
    fontFamily: font.serif, fontSize: 14,
    color: colors.textMuted, lineHeight: 22,
  },
  checkBtns: { flexDirection: 'row', gap: spacing.sm },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  recordDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.coral },
  selfHint: { fontFamily: font.serif, fontSize: 13, color: colors.textFaint },
  permNote: {
    fontFamily: font.sans, fontSize: 12, color: colors.amber,
    textAlign: 'center', lineHeight: 18,
  },

  promptBox: {
    padding: spacing.lg,
    borderLeftWidth: 2,
    borderLeftColor: colors.violet,
    backgroundColor: 'rgba(177,95,176,0.08)',
    borderRadius: radius.sm,
  },
  promptText: {
    fontFamily: font.serif,
    fontSize: 16,
    color: colors.text,
    lineHeight: 27,
    fontStyle: 'italic',
  },

  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  emotionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    backgroundColor: colors.surface2,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipLabel: {
    fontFamily: font.sansSemibold,
    fontSize: 13,
    color: colors.text,
  },
  chipNuance: {
    fontFamily: font.sans,
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  checkedCard: { padding: spacing.xl, gap: spacing.sm },
  emotionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emotionDot: { width: 10, height: 10, borderRadius: 5 },
  emotionName: { fontFamily: font.display, fontSize: 24 },
  emotionBlurb: { fontFamily: font.serif, fontSize: 14, color: colors.textMuted },
  shiftRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  shiftLabel: { fontFamily: font.sansSemibold, fontSize: 11, color: colors.textFaint },
  shiftValue: { fontFamily: font.sansBold, fontSize: 11 },
  recRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: spacing.xs, padding: spacing.md,
    backgroundColor: colors.surface2, borderRadius: radius.sm,
  },
  recLabel: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.teal },
  recArrow: { fontSize: 18, color: colors.teal },

  messageCard: { padding: spacing.xl, gap: spacing.sm },
  messageType: { fontFamily: font.sansSemibold, fontSize: 10, color: colors.teal, letterSpacing: 1.5 },
  messageTitle: { fontFamily: font.display, fontSize: 20, color: colors.text, letterSpacing: 0.3 },
  messageBody: { fontFamily: font.serif, fontSize: 15, color: colors.textMuted, lineHeight: 24 },
  messageAction: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.textFaint, fontStyle: 'italic' },

  sectionTitle: {
    fontFamily: font.sansSemibold, fontSize: 11,
    color: colors.textFaint, letterSpacing: 1.2, textTransform: 'uppercase',
  },
  practiceScroll: { marginHorizontal: -spacing.lg },
  practiceTile: {
    width: 86, height: 86,
    backgroundColor: colors.panel,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginLeft: spacing.lg,
  },
  practiceEmoji: { fontSize: 26 },
  practiceLabel: { fontFamily: font.sansSemibold, fontSize: 10, letterSpacing: 0.3 },
});
