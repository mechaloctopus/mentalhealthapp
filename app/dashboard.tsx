import { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { useStore } from '../src/store';
import { EMOTIONS, getEmotion } from '../src/content/emotions';
import { todaysMessage } from '../src/content/messages';
import { analyzeVoice, buildCheckIn, buildSelfCheckIn } from '../src/engine/voice';
import { recommend } from '../src/engine/recommend';
import { saveCheckIn } from '../src/db';
import { GlassCard } from '../src/components/GlassCard';
import { PressableCard } from '../src/components/PressableCard';
import { GradientButton } from '../src/components/GradientButton';
import { BrandMark } from '../src/components/BrandMark';
import { EmotionWheel } from '../src/components/EmotionWheel';
import { colors, font, radius, spacing, gradients } from '../src/theme/tokens';

type CheckInMode = 'idle' | 'voice-ready' | 'recording' | 'voice-done' | 'self';

export default function Dashboard() {
  const user = useStore((s) => s.user);
  const todayCheckIn = useStore((s) => s.todayCheckIn);
  const recentCheckIns = useStore((s) => s.recentCheckIns);
  const addCheckIn = useStore((s) => s.addCheckIn);
  const baseline = useStore((s) => s.baseline);

  const [mode, setMode] = useState<CheckInMode>('idle');
  const [selectedEmotion, setSelectedEmotion] = useState<string | undefined>();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [meterSamples, setMeterSamples] = useState<number[]>([]);
  const [recordStart, setRecordStart] = useState(0);
  const [processing, setProcessing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const todayMsg = todaysMessage();
  const currentEmotion = todayCheckIn ? getEmotion(todayCheckIn.emotion) : null;
  const rec = todayCheckIn ? recommend(todayCheckIn, recentCheckIns.slice(0, 5).map((c) => c.emotion)) : null;

  // ── Voice check-in ─────────────────────────────────────────────────────

  async function startVoice() {
    const perm = await Audio.requestPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Microphone needed', 'Please allow microphone access to use voice check-in.');
      return;
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    setMode('voice-ready');
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
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
      setMode('idle');
    } finally {
      setProcessing(false);
      setRecording(null);
    }
  }

  // ── Self check-in ──────────────────────────────────────────────────────

  function confirmSelf() {
    if (!selectedEmotion) return;
    const checkin = buildSelfCheckIn(selectedEmotion);
    addCheckIn(checkin);
    saveCheckIn({
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
      note: null,
      factors: null,
      source: 'self',
      baseline_shift: 0,
    });
    setMode('idle');
    setSelectedEmotion(undefined);
  }

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[...gradients.canvas]} style={StyleSheet.absoluteFill} />

      <ScrollView
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

        {/* Today's message */}
        <GlassCard style={styles.messageCard}>
          <Text style={styles.messageType}>{todayMsg.type.toUpperCase()}</Text>
          <Text style={styles.messageTitle}>{todayMsg.title}</Text>
          <Text style={styles.messageBody}>{todayMsg.body}</Text>
          <Text style={styles.messageAction}>{todayMsg.action}</Text>
        </GlassCard>

        {/* Check-in section */}
        {mode === 'idle' && (
          <View style={styles.checkinBar}>
            {todayCheckIn ? (
              <CheckedInCard emotion={currentEmotion!} rec={rec} />
            ) : (
              <View style={styles.checkinPrompt}>
                <Text style={styles.checkinLabel}>How are you feeling?</Text>
                <View style={styles.checkinBtns}>
                  <GradientButton label="🎙️  Voice" onPress={startVoice} style={{ flex: 1 }} />
                  <GradientButton label="Tap" variant="ghost" onPress={() => setMode('self')} style={{ flex: 1 }} />
                </View>
              </View>
            )}
          </View>
        )}

        {mode === 'voice-ready' && (
          <GlassCard style={styles.voiceCard}>
            <Text style={styles.voiceInstruct}>
              Speak naturally for 10–20 seconds — anything on your mind.
            </Text>
            <GradientButton label="Tap to Record" onPress={startRecording} />
          </GlassCard>
        )}

        {mode === 'recording' && (
          <GlassCard style={styles.voiceCard}>
            <View style={styles.recordingDot} />
            <Text style={styles.voiceInstruct}>Recording… tap when done.</Text>
            <GradientButton
              label={processing ? 'Analyzing…' : 'Done'}
              onPress={stopRecording}
              disabled={processing}
              variant="teal"
            />
          </GlassCard>
        )}

        {mode === 'self' && (
          <GlassCard style={styles.selfCard}>
            <Text style={styles.selfLabel}>Tap to select</Text>
            <EmotionWheel
              selected={selectedEmotion}
              onSelect={setSelectedEmotion}
              size={280}
            />
            {selectedEmotion && (
              <View style={styles.selfConfirm}>
                <Text style={styles.selfSelected}>
                  {getEmotion(selectedEmotion).label}
                </Text>
                <GradientButton label="Confirm" onPress={confirmSelf} />
                <GradientButton label="Cancel" variant="ghost" onPress={() => { setMode('idle'); setSelectedEmotion(undefined); }} />
              </View>
            )}
          </GlassCard>
        )}

        {/* Branch tiles */}
        <Text style={styles.sectionTitle}>Branches</Text>
        <View style={styles.tileGrid}>
          <BranchTile
            label="Practices"
            emoji="🌿"
            color={colors.teal}
            route="/(branches)/practices"
          />
          <BranchTile
            label="Journey"
            emoji="✦"
            color={colors.amber}
            route="/(branches)/journey"
          />
          <BranchTile
            label="Journal"
            emoji="📖"
            color={colors.lavender}
            route="/(branches)/journal"
          />
          <BranchTile
            label="Insights"
            emoji="◈"
            color={colors.moss}
            route="/(branches)/insights"
          />
          <BranchTile
            label="Messages"
            emoji="✉"
            color={colors.blue}
            route="/(branches)/messages"
          />
          <BranchTile
            label="You"
            emoji="○"
            color={colors.coral}
            route="/(branches)/you"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CheckedInCard({ emotion, rec }: { emotion: ReturnType<typeof getEmotion>; rec: ReturnType<typeof recommend> | null }) {
  return (
    <GlassCard strong style={styles.checkedInCard}>
      <View style={styles.emotionRow}>
        <View style={[styles.emotionDot, { backgroundColor: emotion.color }]} />
        <Text style={styles.emotionLabel}>{emotion.label}</Text>
      </View>
      <Text style={styles.emotionBlurb}>{emotion.blurb}</Text>
      {rec && (
        <Pressable
          onPress={() => router.push(rec.activity.route as any)}
          style={styles.recRow}
        >
          <Text style={styles.recLabel}>{rec.activity.label}</Text>
          <Text style={styles.recArrow}>›</Text>
        </Pressable>
      )}
    </GlassCard>
  );
}

function BranchTile({ label, emoji, color, route }: { label: string; emoji: string; color: string; route: string }) {
  return (
    <PressableCard
      onPress={() => router.push(route as any)}
      style={styles.tile}
    >
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
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface3,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: font.sansBold, fontSize: 14, color: colors.text },

  messageCard: { padding: spacing.xl, gap: spacing.sm },
  messageType: {
    fontFamily: font.sansSemibold, fontSize: 10,
    color: colors.teal, letterSpacing: 1.5,
  },
  messageTitle: {
    fontFamily: font.display, fontSize: 20,
    color: colors.text, letterSpacing: 0.3,
  },
  messageBody: { fontFamily: font.serif, fontSize: 15, color: colors.textMuted, lineHeight: 24 },
  messageAction: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.textFaint, fontStyle: 'italic' },

  checkinBar: {},
  checkinPrompt: {
    gap: spacing.md,
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1, borderColor: colors.panelBorder,
  },
  checkinLabel: { fontFamily: font.display, fontSize: 18, color: colors.text },
  checkinBtns: { flexDirection: 'row', gap: spacing.md },

  voiceCard: { padding: spacing.xl, gap: spacing.lg, alignItems: 'center' },
  voiceInstruct: {
    fontFamily: font.serif, fontSize: 15,
    color: colors.textMuted, textAlign: 'center', lineHeight: 24,
  },
  recordingDot: {
    width: 12, height: 12,
    borderRadius: 6,
    backgroundColor: colors.coral,
  },

  selfCard: { padding: spacing.xl, gap: spacing.lg, alignItems: 'center' },
  selfLabel: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.textFaint },
  selfSelected: { fontFamily: font.display, fontSize: 22, color: colors.text },
  selfConfirm: { gap: spacing.sm, width: '100%', alignItems: 'center' },

  checkedInCard: { padding: spacing.xl, gap: spacing.sm },
  emotionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emotionDot: { width: 10, height: 10, borderRadius: 5 },
  emotionLabel: { fontFamily: font.display, fontSize: 22, color: colors.text },
  emotionBlurb: { fontFamily: font.serif, fontSize: 14, color: colors.textMuted },
  recRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface2,
    borderRadius: radius.sm,
  },
  recLabel: { fontFamily: font.sansSemibold, fontSize: 13, color: colors.teal },
  recArrow: { fontSize: 18, color: colors.teal },

  sectionTitle: {
    fontFamily: font.sansSemibold, fontSize: 11,
    color: colors.textFaint, letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  tileGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
  },
  tile: {
    width: '30.5%',
    aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
  },
  tileEmoji: { fontSize: 26 },
  tileLabel: { fontFamily: font.sansSemibold, fontSize: 11, letterSpacing: 0.3 },
});
