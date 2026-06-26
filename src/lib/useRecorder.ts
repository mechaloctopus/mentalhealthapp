import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'stopped' | 'denied' | 'error';

export interface Recorder {
  status: RecorderStatus;
  level: SharedValue<number>;
  durationMs: number;
  meters: number[];
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
      if (recRef.current) await recRef.current.stopAndUnloadAsync().catch(() => {});
    } finally {
      recRef.current = null;
    }
  }, []);

  useEffect(() => () => { cleanup(); }, [cleanup]);

  const start = useCallback(async () => {
    metersRef.current = [];
    setDurationMs(0);
    setStatus('requesting');
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setStatus('denied');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(RECORDING_OPTIONS);
      recording.setProgressUpdateInterval(120);
      recording.setOnRecordingStatusUpdate((current) => {
        if (!current.isRecording) return;
        setDurationMs(current.durationMillis ?? 0);
        if (typeof current.metering !== 'number' || !Number.isFinite(current.metering)) return;
        metersRef.current.push(current.metering);
        const normalized = Math.max(0, Math.min(1, (current.metering + 60) / 60));
        level.value = withTiming(normalized, { duration: 110 });
      });
      await recording.startAsync();
      recRef.current = recording;
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
        const current = await recRef.current.getStatusAsync();
        if (current && 'durationMillis' in current && current.durationMillis) result.durationMs = current.durationMillis;
      }
    } catch {
      // The partial recording can still be evaluated from collected meter readings.
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
