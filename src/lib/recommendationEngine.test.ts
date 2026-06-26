import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommendNextStep } from './recommendationEngine';

test('elevated stress routes to breath regulation', () => {
  const rec = recommendNextStep({ emotionId: 'anxious', stress: 'Elevated', energy: 60, calmness: 60, stability: 60 });
  assert.equal(rec.route, '/breath');
  assert.equal(rec.category, 'regulate');
});

test('low energy routes to restorative stillness', () => {
  const rec = recommendNextStep({ emotionId: 'drained', stress: 'Low', energy: 20, calmness: 60, stability: 60 });
  assert.equal(rec.route, '/stillness');
  assert.equal(rec.category, 'restore');
});

test('lonely/sad/frustrated route to connection practice', () => {
  const rec = recommendNextStep({ emotionId: 'lonely', stress: 'Low', energy: 60, calmness: 60, stability: 60 });
  assert.equal(rec.route, '/meta');
  assert.equal(rec.category, 'connect');
});

test('low stability or a sharp drop below baseline routes to restore', () => {
  const rec = recommendNextStep({ emotionId: 'calm', stress: 'Low', energy: 60, calmness: 60, stability: 30 });
  assert.equal(rec.route, '/stillness');
  assert.equal(rec.category, 'restore');
});

test('positive, regulated states route to integration', () => {
  const rec = recommendNextStep({ emotionId: 'joy', stress: 'Low', energy: 60, calmness: 60, stability: 70 });
  assert.equal(rec.route, '/sound');
  assert.equal(rec.category, 'integrate');
});

test('avoids repeating the most recently used practice route when an alternate exists', () => {
  const rec = recommendNextStep({
    emotionId: 'anxious',
    stress: 'Elevated',
    energy: 60,
    calmness: 60,
    stability: 60,
    recentPracticeRoutes: ['/breath'],
  });
  assert.notEqual(rec.route, '/breath');
});

test('every recommendation includes wisdom, purpose, and a rationale', () => {
  const rec = recommendNextStep({ emotionId: 'calm', stress: 'Low', energy: 60, calmness: 60, stability: 70 });
  assert.ok(rec.wisdom);
  assert.ok(rec.purpose);
  assert.ok(rec.rationale.length > 0);
  assert.ok(rec.durationMinutes > 0);
});
