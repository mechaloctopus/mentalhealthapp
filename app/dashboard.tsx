import { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, SafeAreaView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { useStore } from '../src/store';
import { EMOTIONS, getEmotion } from '../src/content/emotions';
import { todaysMessage } from '../src/content/messages';
import { analyzeVoice, buildCheckIn, buildSelfCheckIn } from '../src/engine/voice';
import type { Affect } from '../src/engine/voice';
import { recommend } from '../src/engine/recommend';
import { saveCheckIn, saveBaseline } from '../src/db';
import { GlassCard } from '../src/components/GlassCard';
import { PressableCard } from '../src/components/PressableCard';
import { GradientButton } from '../src/components/GradientButton';
import { BrandMark } from '../src/components/BrandMark';
import { EmotionWheel } from '../src/components/EmotionWheel';
import { BreathingGuide } from '../src/components/BreathingGuide';
import { EmotionResults } from '../src/components/EmotionResults';
import { colors, font, radius, spacing, gradients } from '../src/theme/tokens';

type CheckInMode =
  | 'idle'
  | 'baseline-intro'
  | 'baseline-breathing'
  | 'voice-ready'
  | 'recording'
  | 'self'
  | 'results';

export default function Dashboard() {
  const user = useStore((s) => s.user);
  const todayCheckIn = useStore((s) => s.todayCheckIn);
  const recentCheckIns = useStore((s) => s.recentCheckIns);
  const addCheckIn = useStore((s) => s.addCheckIn);
  const baseline = useStore((s) => s.baseline);
  const setBaseline = useStore((s) => s.setBaseline);

  const [mode, setMode] = useState<CheckInMode>('idle');
  const [isBaselineSession, setIsBaselineSession] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string | undefined>();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [meterSamples, setMeterSamples] = useState<number[]>([]);
  const [recordStart, setRecordStart] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [lastAffect, setLastAffect] = useState<Affect | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const todayMsg = todaysMessage();
  const needsBaseline = !baseline;
  const hasTodayCheckIn = !!todayCheckIn;
  const currentEmotion = todayCheckIn ? getEmotion(todayCheckIn.emotion) : null;
  const rec = todayCheckIn ? recommend(todayCheckIn, recentCheckIns.slice(0, 5).map((c) => c.emotion)) : null;

  // ── Voice recording ─────────────────────────────────────────────────────

  async function startVoice(forBaseline = false) {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert(
          'Microphone needed',
          'Please allow microphone access in Settings to use voice check-in.',
        );
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      setIsBaselineSession(forBaseline);
      setMode('voice-ready');
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 80);
    } catch {
      Alert.alert('Microphone error', 'Could not access the microphone. Please try again.');
    }
  }

  async function startRecording() {
    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync({
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
      isMeteringEnabled: true,
    });
    await rec.startAsync();
    setRecording(rec);
    setRecordStart(Date.now());
    setMeterSamples([]);
    setMode('recording');

    intervalRef.current = setInterval(async () => {
      const status = await rec.getStatusAsync();
      if (status.isRecording && status.metering !== undefined) {
        setMeterSamples((prev) => [...prev, status.metering!]);
      }
    }, 150);
  }

  async function stopRecording() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (!recording) return;
    setProcessing(true);
    try {
      await recording.stopAndUnloadAsync();
      const duration = Date.now() - recordStart;
      const affect = analyzeVoice(meterSamples, duration);
      if (!affect) {
        Alert.alert('Too short', 'Speak for at least 5 seconds and try again.');
        setMode('idle');
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
        };
        await saveBaseline(b);
        setBaseline(b);
        setMode('results');
        return;
      }

      const checkin = buildCheckIn({ affect, baseline });
      addCheckIn(checkin);
      await saveCheckIn({
        id: checkin.id,
        at: checkin.at,
        emotion: checkin.emotion,
        valence: checkin.valence,
        arousal: checkin.arousal,
        energy: checkin.energy,
        calmness: checkin.calmness,
        stability: checkin.stability,
        stress: checkin.stress,
        confidence: checkin.confidence,
        voice_emotion: checkin.voiceEmotion,
        self_emotion: checkin.selfEmotion ?? null,
        note: checkin.note ?? null,
        factors: checkin.factors ?? null,
        source: checkin.source,
        baseline_shift: checkin.baselineShift,
      });
      setMode('results');
    } finally {
      setProcessing(false);
      setRecording(null);
    }
  }

  // ── Manual check-in ──────────────────────────────────────────────────────

  function confirmSelf() {
    if (!selectedEmotion) return;
    const checkin = buildSelfCheckIn(selectedEmotion);
    addCheckIn(checkin);
    saveCheckIn({
      id: checkin.id, at: checkin.at, emotion: checkin.emotion,
      valence: checkin.valence, arousal: checkin.arousal,
      energy: checkin.energy, calmness: checkin.calmness, stability: checkin.stability,
      stress: checkin.stress, confidence: checkin.confidence,
      voice_emotion: checkin.voiceEmotion, self_emotion: checkin.selfEmotion ?? null,
      note: null, factors: null, source: 'self', baseline_shift: 0,
    });
    setMode('idle');
    setSelectedEmotion(undefined);
  }

  const handleBreathingComplete = useCallback(() => {
    startVoice(true);
  }, []);

  const handleResultsDismiss = useCallback(() => {
    setMode('idle');
    setLastAffect(null);
    setIsBaselineSession(false);
  }, []);

  // ── Render check-in section ───────────────────────────────────────────────

  function renderCheckin() {
    // Show results immediately after a recording
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

    // Breathing guide for baseline
    if (mode === 'baseline-breathing') {
      return (
        <GlassCard style={styles.actionCard}>
          <BreathingGuide onComplete={handleBreathingComplete} />
        </GlassCard>
      );
    }

    // Voice ready (either baseline or regular)
    if (mode === 'voice-ready') {
      return (
        <GlassCard style={styles.actionCard}>
          <Text style={styles.actionHeading}>
            {isBaselineSession ? 'Record your baseline' : 'Voice check-in'}
          </Text>
          <Text style={styles.actionSub}>
            {isBaselineSession
              ? 'Speak naturally for 10–20 seconds. Say anything on your mind — how you\'re feeling, what you\'re thinking about.'
              : 'Speak naturally for 10–20 seconds. No performance needed — just talk.'}
          </Text>
          <GradientButton label="Tap to Record" variant="flame" onPress={startRecording} />
          <GradientButton label="Cancel" variant="ghost" onPress={() => setMode('idle')} />
        </GlassCard>
      );
    }

    // Recording in progress
    if (mode === 'recording') {
      return (
        <GlassCard style={styles.actionCard}>
          <View style={styles.recordRow}>
            <View style={styles.recordDot} />
            <Text style={styles.actionHeading}>Recording…</Text>
          </View>
          <Text style={styles.actionSub}>Speak naturally. Tap Done when finished.</Text>
          <GradientButton
            label={processing ? 'Analyzing…' : 'Done'}
            variant="teal"
            onPress={stopRecording}
            disabled={processing}
          />
        </GlassCard>
      );
    }

    // Manual emotion wheel
    if (mode === 'self') {
      return (
        <GlassCard style={styles.actionCard}>
          <Text style={styles.actionHeading}>What are you feeling?</Text>
          <Text style={styles.selfHint}>Tap the tone that feels closest right now.</Text>
          <EmotionWheel selected={selectedEmotion} onSelect={setSelectedEmotion} size={260} />
          {selectedEmotion && (
            <View style={styles.selfConfirm}>
              <Text style={styles.selfChosen}>{getEmotion(selectedEmotion).label}</Text>
              <GradientButton label="Confirm" variant="flame" onPress={confirmSelf} />
              <GradientButton label="Cancel" variant="ghost"
                onPress={() => { setMode('idle'); setSelectedEmotion(undefined); }} />
            </View>
          )}
        </GlassCard>
      );
    }

    // Idle — today's check-in already done
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

    // Idle — needs baseline first
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

    // Idle — regular check-in prompt
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

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <BrandMark size="sm" />
          <Pressable onPress={() => router.push('/(branches)/you')} style={styles.avatarBtn}>
            <Text style={styles.avatarText}>{user?.displayName?.[0] ?? 'Y'}</Text>
          </Pressable>
        </View>

        {/* ── PRIMARY: Check-in section ─────────────────────────────────── */}
        {renderCheckin()}

        {/* Today's message — secondary, below check-in */}
        {mode === 'idle' && (
          <GlassCard style={styles.messageCard}>
            <Text style={styles.messageType}>{todayMsg.type.toUpperCase()}</Text>
            <Text style={styles.messageTitle}>{todayMsg.title}</Text>
            <Text style={styles.messageBody}>{todayMsg.body}</Text>
            <Text style={styles.messageAction}>{todayMsg.action}</Text>
          </GlassCard>
        )}

        {/* Branch tiles */}
        <Text style={styles.sectionTitle}>Branches</Text>
        <View style={styles.tileGrid}>
          {BRANCH_TILES.map((t) => (
            <BranchTile key={t.label} {...t} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const BRANCH_TILES = [
  { label: 'Practices', emoji: '🌿', color: colors.teal, route: '/(branches)/practices' },
  { label: 'Journey', emoji: '✦', color: colors.amber, route: '/(branches)/journey' },
  { label: 'Journal', emoji: '📖', color: colors.lavender, route: '/(branches)/journal' },
  { label: 'Insights', emoji: '◈', color: colors.moss, route: '/(branches)/insights' },
  { label: 'Messages', emoji: '✉', color: colors.blue, route: '/(branches)/messages' },
  { label: 'You', emoji: '○', color: colors.coral, route: '/(branches)/you' },
];

function BranchTile({ label, emoji, color, route }: { label: string; emoji: string; color: string; route: string }) {
  return (
    <PressableCard onPress={() => router.push(route as any)} style={styles.tile}>
      <Text style={styles.tileEmoji}>{emoji}</Text>
      <Text style={[styles.tileLabel, { color }]}>{label}</Text>
    </PressableCard>
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
  avatarBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface3,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: font.sansBold, fontSize: 14, color: colors.text },

  // ── Check-in cards ──────────────────────────────────────────────────────
  actionCard: { padding: spacing.xl, gap: spacing.md, overflow: 'hidden' },
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
  selfConfirm: { gap: spacing.sm, alignItems: 'center', width: '100%' },
  selfChosen: { fontFamily: font.display, fontSize: 22, color: colors.text },

  // ── Checked-in card ─────────────────────────────────────────────────────
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

  // ── Daily message ────────────────────────────────────────────────────────
  messageCard: { padding: spacing.xl, gap: spacing.sm },
  messageType: { fontFamily: font.sansSemibold, fontSize: 10, color: colors.teal, letterSpacing: 1.5 },
  messageTitle: { fontFamily: font.display, fontSize: 20, color: colors.text, letterSpacing: 0.3 },
  messageBody: { fontFamily: font.serif, fontSize: 15, color: colors.textMuted, lineHeight: 24 },
  messageAction: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.textFaint, fontStyle: 'italic' },

  // ── Branches ─────────────────────────────────────────────────────────────
  sectionTitle: {
    fontFamily: font.sansSemibold, fontSize: 11,
    color: colors.textFaint, letterSpacing: 1.2, textTransform: 'uppercase',
  },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: { width: '30.5%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xs, padding: spacing.md },
  tileEmoji: { fontSize: 26 },
  tileLabel: { fontFamily: font.sansSemibold, fontSize: 11, letterSpacing: 0.3 },
});
