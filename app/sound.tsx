import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { ModalHeader } from '../src/components/ModalHeader';
import { Body, Muted, Serif, Label, Display, GlassCard } from '../src/components/ui';
import { toneUri, type SoundPreset } from '../src/lib/tone';
import { useApp } from '../src/context/AppContext';
import { colors, font, radius, spacing } from '../src/theme/theme';
import { select, tap } from '../src/lib/haptics';

const PRESETS: SoundPreset[] = [
  { key: 'schumann', name: 'Schumann', hz: '7.83 Hz', copy: 'Earth-like low pulse — grounding and steady.', color: colors.moss, spec: { mode: 'am', carrier: 110, beatOrMod: 8, amplitude: 0.26 } },
  { key: 'solfeggio', name: 'Solfeggio', hz: '528 Hz', copy: 'Warm harmonic center for reflection sessions.', color: colors.amber, spec: { mode: 'pure', carrier: 528, amplitude: 0.16 } },
  { key: 'alpha', name: 'Alpha', hz: '10 Hz beat', copy: 'Headphone binaural mode — calm, gentle focus.', color: colors.teal, spec: { mode: 'binaural', carrier: 220, beatOrMod: 10, amplitude: 0.2 }, needsHeadphones: true },
  { key: 'theta', name: 'Theta', hz: '6 Hz beat', copy: 'Deeper, spacious pulsing for meditation.', color: colors.lavender, spec: { mode: 'binaural', carrier: 200, beatOrMod: 6, amplitude: 0.2 }, needsHeadphones: true },
  { key: 'sleep', name: 'Sleep', hz: '3 Hz feel', copy: 'Slow low pulse and a settling bass bed for rest.', color: colors.blue, spec: { mode: 'am', carrier: 90, beatOrMod: 3, amplitude: 0.28 } },
];

export default function Sound() {
  const { addSession } = useApp();
  const [active, setActive] = useState<SoundPreset>(PRESETS[0]);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const startedAt = useRef(0);

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse]);
  const orb = useAnimatedStyle(() => ({
    transform: [{ scale: (playing ? 0.9 : 0.8) + pulse.value * (playing ? 0.22 : 0.06) }],
    opacity: 0.5 + pulse.value * (playing ? 0.4 : 0.15),
  }));

  useEffect(() => {
    return () => { unload(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setElapsed(Math.round((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [playing]);

  const unload = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
  };

  const play = async (preset: SoundPreset) => {
    setLoading(true);
    await unload();
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const { sound } = await Audio.Sound.createAsync(
        { uri: toneUri(preset.spec) },
        { isLooping: true, volume: 0.9 }
      );
      soundRef.current = sound;
      await sound.playAsync();
      startedAt.current = Date.now();
      setElapsed(0);
      setPlaying(true);
    } catch {
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  };

  const toggle = async () => {
    tap();
    if (playing) {
      await unload();
      if (elapsed > 20) addSession({ kind: 'sound', minutes: Math.max(1, Math.round(elapsed / 60)) });
      setPlaying(false);
    } else {
      await play(active);
    }
  };

  const choose = async (preset: SoundPreset) => {
    select();
    setActive(preset);
    if (playing) await play(preset);
  };

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={active.color} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ModalHeader title="Sound" accent={active.color} />

        <View style={styles.stage}>
          <Animated.View style={[styles.orb, { backgroundColor: active.color, shadowColor: active.color }, orb]} />
          <Pressable onPress={toggle} style={[styles.playBtn, { borderColor: active.color + '66' }]}>
            {loading ? (
              <ActivityIndicator color={active.color} />
            ) : (
              <Ionicons name={playing ? 'pause' : 'play'} size={30} color={active.color} style={!playing && { marginLeft: 3 }} />
            )}
          </Pressable>
        </View>

        <View style={styles.nowPlaying}>
          <Serif center style={{ fontSize: 24 }}>{active.name}</Serif>
          <Muted center style={{ marginTop: 2 }}>
            {active.hz}{playing ? `  ·  ${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}` : ''}
          </Muted>
          {active.needsHeadphones ? (
            <View style={styles.headphoneHint}>
              <Ionicons name="headset-outline" size={13} color={colors.textDim} />
              <Muted style={{ fontSize: 12 }}>Best with headphones</Muted>
            </View>
          ) : null}
        </View>

        <View style={styles.list}>
          {PRESETS.map((p) => {
            const on = p.key === active.key;
            return (
              <Pressable key={p.key} onPress={() => choose(p)}>
                <GlassCard style={[styles.presetRow, on && { borderColor: p.color + '88' }]}>
                  <View style={[styles.swatch, { backgroundColor: p.color }]} />
                  <View style={{ flex: 1 }}>
                    <Body color={colors.text} style={{ fontFamily: font.sansSemibold, fontSize: 14.5 }}>{p.name} · {p.hz}</Body>
                    <Muted style={{ fontSize: 12.5 }}>{p.copy}</Muted>
                  </View>
                  {on && playing ? <Ionicons name="volume-medium" size={18} color={p.color} /> : null}
                </GlassCard>
              </Pressable>
            );
          })}
        </View>

        <Muted center style={styles.disclaimer}>
          Synthesized tones for relaxation and sound exploration only — no disease-treatment claims. Keep volume gentle.
        </Muted>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center', height: 220 },
  orb: { position: 'absolute', width: 200, height: 200, borderRadius: 200, opacity: 0.5, shadowOpacity: 0.7, shadowRadius: 40 },
  playBtn: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10,12,11,0.6)', borderWidth: 1 },
  nowPlaying: { alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  headphoneHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  presetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md },
  swatch: { width: 12, height: 38, borderRadius: 6 },
  disclaimer: { marginTop: 'auto', paddingHorizontal: spacing.xl, paddingBottom: spacing.md, fontSize: 11.5, lineHeight: 17 },
});
