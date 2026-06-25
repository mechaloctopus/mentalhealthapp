import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AnimatedBackground } from '../src/components/AnimatedBackground';
import { ModalHeader } from '../src/components/ModalHeader';
import { Body, Muted, Serif, Label } from '../src/components/ui';
import { noiseUri, toneUri, type NoiseKind, type ToneSpec } from '../src/lib/tone';
import { useApp } from '../src/context/AppContext';
import { colors, font, radius, spacing } from '../src/theme/theme';
import { select, tap } from '../src/lib/haptics';

interface Layer {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  uri: () => string;
}

const LAYERS: Layer[] = [
  { id: 'rain', name: 'Rain', icon: 'rainy-outline', color: colors.blue, uri: () => noiseUri('rain', 0.13) },
  { id: 'ocean', name: 'Ocean waves', icon: 'water-outline', color: colors.teal, uri: () => noiseUri('ocean', 0.18) },
  { id: 'brown', name: 'Brown noise', icon: 'cloud-outline', color: colors.moss, uri: () => noiseUri('brown', 0.16) },
  { id: 'pad', name: 'Deep pad', icon: 'musical-note-outline', color: colors.lavender, uri: () => toneUri({ mode: 'pure', carrier: 70, amplitude: 0.16 } as ToneSpec) },
  { id: 'earth', name: 'Earth pulse', icon: 'pulse-outline', color: colors.amber, uri: () => toneUri({ mode: 'am', carrier: 110, beatOrMod: 8, amplitude: 0.18 } as ToneSpec) },
];

const VOLUMES = [0, 0.25, 0.55, 0.9]; // off, low, med, high
const TIMERS = [15, 30, 45]; // minutes

export default function Sleep() {
  const { addSession } = useApp();
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [timer, setTimer] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const sounds = useRef<Record<string, Audio.Sound>>({});
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false }).catch(() => {});
    return () => { stopAll(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sleep timer countdown.
  useEffect(() => {
    if (remaining == null) return;
    if (remaining <= 0) { stopAll(); setTimer(null); setRemaining(null); return; }
    const t = setTimeout(() => setRemaining((r) => (r == null ? null : r - 1)), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const stopAll = async () => {
    for (const id of Object.keys(sounds.current)) {
      const s = sounds.current[id];
      await s.stopAsync().catch(() => {});
      await s.unloadAsync().catch(() => {});
    }
    sounds.current = {};
    if (startedAt.current) {
      const mins = Math.round((Date.now() - startedAt.current) / 60000);
      if (mins >= 1) addSession({ kind: 'sound', minutes: mins });
      startedAt.current = null;
    }
    setLevels({});
  };

  const cycle = async (layer: Layer) => {
    select();
    const cur = levels[layer.id] ?? 0;
    const next = (cur + 1) % VOLUMES.length;
    const vol = VOLUMES[next];
    setLevels((l) => ({ ...l, [layer.id]: next }));

    if (!sounds.current[layer.id]) {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri: layer.uri() }, { isLooping: true, volume: vol });
        sounds.current[layer.id] = sound;
        if (vol > 0) { await sound.playAsync(); if (!startedAt.current) startedAt.current = Date.now(); }
      } catch { /* ignore */ }
    } else {
      const s = sounds.current[layer.id];
      await s.setVolumeAsync(vol).catch(() => {});
      if (vol > 0) { await s.playAsync().catch(() => {}); if (!startedAt.current) startedAt.current = Date.now(); }
      else await s.pauseAsync().catch(() => {});
    }
  };

  const setSleepTimer = (mins: number) => {
    tap();
    if (timer === mins) { setTimer(null); setRemaining(null); }
    else { setTimer(mins); setRemaining(mins * 60); }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const anyOn = Object.values(levels).some((v) => v > 0);

  return (
    <View style={{ flex: 1 }}>
      <AnimatedBackground tint={colors.blue} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ModalHeader title="Sleep mixer" accent={colors.blue} right={remaining != null ? <Body color={colors.blue} style={{ fontFamily: font.sansSemibold }}>{fmt(remaining)}</Body> : undefined} />

        <Animated.ScrollView entering={FadeIn} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
          <Serif style={{ fontSize: 24, marginBottom: 4 }}>Build your soundscape</Serif>
          <Muted style={{ marginBottom: spacing.xl }}>
            Layer textures and tap to set each level. A dark, quiet room and a slow exhale do the rest.
          </Muted>

          <View style={{ gap: spacing.sm }}>
            {LAYERS.map((layer) => {
              const lvl = levels[layer.id] ?? 0;
              return (
                <Pressable key={layer.id} onPress={() => cycle(layer)}>
                  <View style={[styles.layer, lvl > 0 && { borderColor: layer.color + '88' }]}>
                    <View style={[styles.icon, { backgroundColor: layer.color + (lvl > 0 ? '26' : '12') }]}>
                      <Ionicons name={layer.icon} size={20} color={layer.color} />
                    </View>
                    <Body color={colors.text} style={{ flex: 1, fontFamily: font.sansSemibold, fontSize: 15 }}>{layer.name}</Body>
                    <View style={styles.bars}>
                      {[1, 2, 3].map((b) => (
                        <View key={b} style={[styles.bar, { height: 6 + b * 5, backgroundColor: lvl >= b ? layer.color : colors.surfaceActive }]} />
                      ))}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Label style={{ marginTop: spacing.xl, marginBottom: 12 }}>SLEEP TIMER</Label>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {TIMERS.map((m) => (
              <Pressable key={m} onPress={() => setSleepTimer(m)} style={[styles.timer, timer === m && { backgroundColor: colors.blue, borderColor: colors.blue }]}>
                <Body style={{ fontFamily: font.sansSemibold, fontSize: 13, color: timer === m ? colors.black : colors.textMuted }}>{m} min</Body>
              </Pressable>
            ))}
            {anyOn && (
              <Pressable onPress={() => { tap(); stopAll(); setTimer(null); setRemaining(null); }} style={[styles.timer, { marginLeft: 'auto', borderColor: colors.coral + '55' }]}>
                <Body style={{ fontFamily: font.sansSemibold, fontSize: 13, color: colors.coral }}>Stop all</Body>
              </Pressable>
            )}
          </View>

          <Muted style={{ marginTop: spacing.xl, fontSize: 11.5, lineHeight: 17 }}>
            Synthesized textures for rest only. Keep the volume gentle, and charge your phone outside the bedroom when you can.
          </Muted>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.panelBorder, backgroundColor: colors.panel },
  icon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 22 },
  bar: { width: 5, borderRadius: 3 },
  timer: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.panelBorder, backgroundColor: 'rgba(255,255,255,0.04)' },
});
