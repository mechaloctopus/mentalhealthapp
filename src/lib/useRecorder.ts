import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'stopped' | 'denied' | 'error';

export interface Recorder {
  status: RecorderStatus;
  level: SharedValue<number>; // 0..1 live loudness for the waveform
  durationMs: number;
  meters: number[]; // captured metering dB values
  start: () => Promise<void>;
  stop: () => Promise<{ meters: number[]; durationMs: number }>;
  reset: () => void;
}

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
  android: { ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android },
  ios: { ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios },
};

export function useRecorder(): Recorder {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [durationMs, setDurationMs] = useState(0);
  const level = useSharedValue(0);
  const recRef = useRef<Audio.Recording | null>(null);
  const metersRef = useRef<number[]>([]);

  const cleanup = useCallback(async () => {
    try {
      if (recRef.current) {
        await recRef.current.stopAndUnloadAsync().catch(() => {});
      }
    } finally {
      recRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const start = useCallback(async () => {
    metersRef.current = [];
    setDurationMs(0);
    setStatus('requesting');
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setStatus('denied');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(RECORDING_OPTIONS);
      rec.setProgressUpdateInterval(120);
      rec.setOnRecordingStatusUpdate((s) => {
        if (!s.isRecording) return;
        setDurationMs(s.durationMillis ?? 0);
        const db = typeof s.metering === 'number' ? s.metering : -60;
        metersRef.current.push(db);
        const norm = Math.max(0, Math.min(1, (db + 60) / 60));
        level.value = withTiming(norm, { duration: 110 });
      });
      await rec.startAsync();
      recRef.current = rec;
      setStatus('recording');
    } catch {
      setStatus('error');
    }
  }, [level]);

  const stop = useCallback(async () => {
    const result = { meters: metersRef.current.slice(), durationMs };
    try {
      if (recRef.current) {
        await recRef.current.stopAndUnloadAsync();
        const s = await recRef.current.getStatusAsync();
        if (s && 'durationMillis' in s && s.durationMillis) result.durationMs = s.durationMillis;
      }
    } catch {
      /* ignore */
    } finally {
      recRef.current = null;
      level.value = withTiming(0, { duration: 200 });
      setStatus('stopped');
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
    }
    return result;
  }, [durationMs, level]);

  const reset = useCallback(() => {
    metersRef.current = [];
    setDurationMs(0);
    setStatus('idle');
    level.value = 0;
  }, [level]);

  return { status, level, durationMs, meters: metersRef.current, start, stop, reset };
}
