import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PHQ9, GAD7, severity } from './screeners';

test('PHQ-9 severity bands', () => {
  assert.equal(severity(PHQ9, 0), 'Minimal');
  assert.equal(severity(PHQ9, 4), 'Minimal');
  assert.equal(severity(PHQ9, 5), 'Mild');
  assert.equal(severity(PHQ9, 14), 'Moderate');
  assert.equal(severity(PHQ9, 19), 'Moderately severe');
  assert.equal(severity(PHQ9, 27), 'Severe');
});

test('GAD-7 severity bands', () => {
  assert.equal(severity(GAD7, 0), 'Minimal');
  assert.equal(severity(GAD7, 9), 'Mild');
  assert.equal(severity(GAD7, 21), 'Severe');
});

test('severity falls back to the highest band above the max score', () => {
  assert.equal(severity(PHQ9, 999), 'Severe');
});

test('PHQ-9 flags item 9 (self-harm) as the sensitive item', () => {
  assert.equal(PHQ9.sensitiveItem, 8);
  assert.equal(PHQ9.items[PHQ9.sensitiveItem!], 'Thoughts that you would be better off dead, or of hurting yourself');
});

test('GAD-7 has no sensitive item', () => {
  assert.equal(GAD7.sensitiveItem, undefined);
});
