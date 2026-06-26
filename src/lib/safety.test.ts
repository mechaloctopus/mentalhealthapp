import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CRISIS_SUPPORT, screenerSafetyMessage, wellnessDisclaimer } from './safety';

test('screenerSafetyMessage returns crisis support when flagged', () => {
  assert.equal(screenerSafetyMessage(true), CRISIS_SUPPORT);
});

test('screenerSafetyMessage returns null when not flagged or undefined', () => {
  assert.equal(screenerSafetyMessage(false), null);
  assert.equal(screenerSafetyMessage(undefined), null);
});

test('crisis support message references 988 and emergency services', () => {
  assert.match(CRISIS_SUPPORT.emergency, /988/);
  assert.match(CRISIS_SUPPORT.action, /emergency services/i);
});

test('wellnessDisclaimer states the app does not diagnose or treat', () => {
  assert.match(wellnessDisclaimer(), /does not diagnose, treat/);
});
