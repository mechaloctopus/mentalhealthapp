import { test } from 'node:test';
import assert from 'node:assert/strict';
import { voiceSampleQuality, analyzeVoice, baselineShift, recommendFor } from './voice';
import { getEmotion } from './emotions';

test('voiceSampleQuality rejects too-short recordings', () => {
  const q = voiceSampleQuality([-30, -28, -32], 1000);
  assert.equal(q.usable, false);
  assert.equal(q.reason, 'too-short');
});

test('voiceSampleQuality rejects too few finite samples', () => {
  const q = voiceSampleQuality([-30, -28, NaN, NaN], 4000);
  assert.equal(q.usable, false);
  assert.equal(q.reason, 'too-few-samples');
});

test('voiceSampleQuality rejects mostly-silent recordings', () => {
  const samples = new Array(20).fill(-70);
  const q = voiceSampleQuality(samples, 4000);
  assert.equal(q.usable, false);
  assert.equal(q.reason, 'mostly-silent');
});

test('voiceSampleQuality rejects a flat signal with no dynamic range', () => {
  const samples = new Array(20).fill(-30);
  const q = voiceSampleQuality(samples, 4000);
  assert.equal(q.usable, false);
  assert.equal(q.reason, 'flat-signal');
});

test('voiceSampleQuality accepts a varied, active recording', () => {
  const samples = Array.from({ length: 40 }, (_, i) => -40 + Math.sin(i) * 15);
  const q = voiceSampleQuality(samples, 5000);
  assert.equal(q.usable, true);
  assert.equal(q.reason, 'ok');
});

test('analyzeVoice returns null for an unusable sample', () => {
  assert.equal(analyzeVoice([-70, -70, -70], 500), null);
});

test('analyzeVoice returns an affect estimate for a usable sample', () => {
  const samples = Array.from({ length: 40 }, (_, i) => -40 + Math.sin(i) * 15);
  const affect = analyzeVoice(samples, 5000);
  assert.ok(affect);
  assert.ok(affect!.valence >= -1 && affect!.valence <= 1);
  assert.ok(affect!.arousal >= -1 && affect!.arousal <= 1);
  assert.ok(['Low', 'Mild', 'Elevated'].includes(affect!.stress));
  assert.ok(affect!.confidence >= 0 && affect!.confidence <= 1);
});

test('baselineShift is 0 with no baseline', () => {
  assert.equal(baselineShift({ valence: 0.5, arousal: 0.2 }, null), 0);
});

test('baselineShift is positive when now is better than baseline', () => {
  const baseline = { energy: 50, calmness: 50, stability: 50, valence: -0.5, arousal: 0.5, capturedAt: 0 };
  const shift = baselineShift({ valence: 0.5, arousal: -0.5 }, baseline);
  assert.ok(shift > 0);
});

test('recommendFor maps known emotions to a practice with a reason', () => {
  const rec = recommendFor(getEmotion('anxious'));
  assert.equal(rec.route, '/breath');
  assert.ok(rec.reason.length > 0);
});

test('recommendFor returns a non-empty reason for every named emotion', () => {
  for (const id of ['joy', 'excited', 'proud', 'grateful', 'content', 'calm', 'overwhelmed', 'anxious', 'frustrated', 'sad', 'lonely', 'drained']) {
    const rec = recommendFor(getEmotion(id));
    assert.ok(rec.practice.length > 0);
    assert.ok(rec.reason.length > 0);
  }
});
