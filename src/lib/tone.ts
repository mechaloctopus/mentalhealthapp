// Generates short, seamlessly-looping WAV tones at runtime (no asset files needed),
// returned as a data: URI that expo-av can play on loop. Used by the Sound screen
// for frequency-assisted relaxation. Honest about being simple synthesized tones.

const SAMPLE_RATE = 44100;
const LOOP_SECONDS = 1; // 1.000s @ 44100 → integer cycles for integer Hz = seamless loop

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64FromBytes(bytes: Uint8Array): string {
  let out = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + B64[(n >> 6) & 63] + B64[n & 63];
  }
  const rem = bytes.length - i;
  if (rem === 1) {
    const n = bytes[i] << 16;
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + '==';
  } else if (rem === 2) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8);
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + B64[(n >> 6) & 63] + '=';
  }
  return out;
}

export type ToneMode = 'binaural' | 'am' | 'pure';

export interface ToneSpec {
  mode: ToneMode;
  carrier: number; // Hz (integer)
  beatOrMod?: number; // Hz (integer) — beat freq (binaural) or modulation freq (am)
  amplitude?: number; // 0..1
}

// Build a stereo 16-bit PCM WAV (1s loop) and return a playable data URI.
export function toneUri(spec: ToneSpec): string {
  const amp = (spec.amplitude ?? 0.22) * 0x7fff;
  const n = SAMPLE_RATE * LOOP_SECONDS;
  const channels = 2;
  const bytesPerSample = 2;
  const dataLen = n * channels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataLen);
  const view = new DataView(buffer);

  // RIFF header
  writeStr(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLen, true);
  writeStr(view, 8, 'WAVE');
  writeStr(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeStr(view, 36, 'data');
  view.setUint32(40, dataLen, true);

  const twoPi = Math.PI * 2;
  let off = 44;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    let left: number;
    let right: number;
    if (spec.mode === 'binaural') {
      const beat = spec.beatOrMod ?? 6;
      left = Math.sin(twoPi * spec.carrier * t);
      right = Math.sin(twoPi * (spec.carrier + beat) * t);
    } else if (spec.mode === 'am') {
      const mod = spec.beatOrMod ?? 8;
      const env = 0.5 + 0.5 * Math.sin(twoPi * mod * t);
      const s = Math.sin(twoPi * spec.carrier * t) * env;
      left = s;
      right = s;
    } else {
      const s = Math.sin(twoPi * spec.carrier * t);
      left = s;
      right = s;
    }
    view.setInt16(off, left * amp, true); off += 2;
    view.setInt16(off, right * amp, true); off += 2;
  }

  const b64 = base64FromBytes(new Uint8Array(buffer));
  return `data:audio/wav;base64,${b64}`;
}

function writeStr(view: DataView, offset: number, s: string) {
  for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
}

export type NoiseKind = 'white' | 'brown' | 'rain' | 'ocean';

// Looping ambient noise as a data URI. A short seam crossfade keeps the loop smooth.
export function noiseUri(kind: NoiseKind, amplitude = 0.16, seconds = 4): string {
  const total = SAMPLE_RATE * seconds;
  const fade = Math.floor(SAMPLE_RATE * 0.05); // 50ms seam crossfade
  const gen = total + fade;
  const mono = new Float32Array(gen);

  let brown = 0;
  let lp = 0; // simple low-pass state for rain/ocean
  for (let i = 0; i < gen; i++) {
    const white = Math.random() * 2 - 1;
    let v: number;
    if (kind === 'white') {
      v = white;
    } else if (kind === 'brown') {
      brown = (brown + 0.02 * white) / 1.02;
      v = brown * 3.2;
    } else if (kind === 'rain') {
      lp += 0.2 * (white - lp);
      v = (white * 0.4 + lp * 1.4);
    } else {
      // ocean: brown noise slowly swelling like waves
      brown = (brown + 0.02 * white) / 1.02;
      const swell = 0.5 + 0.5 * Math.sin((2 * Math.PI * i) / (SAMPLE_RATE * 6));
      v = brown * 3.2 * swell;
    }
    mono[i] = v;
  }
  // crossfade the head with the tail so the loop point is seamless.
  for (let i = 0; i < fade; i++) {
    const w = i / fade;
    mono[i] = mono[i] * w + mono[total + i] * (1 - w);
  }

  const n = total;
  const channels = 2;
  const dataLen = n * channels * 2;
  const buffer = new ArrayBuffer(44 + dataLen);
  const view = new DataView(buffer);
  writeStr(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLen, true);
  writeStr(view, 8, 'WAVE');
  writeStr(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(view, 36, 'data');
  view.setUint32(40, dataLen, true);

  const amp = amplitude * 0x7fff;
  let off = 44;
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, mono[i])) * amp;
    view.setInt16(off, s, true); off += 2;
    view.setInt16(off, s, true); off += 2;
  }
  return `data:audio/wav;base64,${base64FromBytes(new Uint8Array(buffer))}`;
}

export interface SoundPreset {
  key: string;
  name: string;
  hz: string;
  copy: string;
  color: string;
  spec: ToneSpec;
  needsHeadphones?: boolean;
}
