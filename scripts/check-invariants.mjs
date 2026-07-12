#!/usr/bin/env node
// Validates structural invariants that TypeScript's type system can't catch.
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

let failed = false;
function fail(msg) {
  console.error('FAIL:', msg);
  failed = true;
}

const emotionsText = readFileSync(resolve(root, 'src/content/emotions.ts'), 'utf8');
const schoolsText  = readFileSync(resolve(root, 'src/content/schools.ts'),  'utf8');

// Emotion IDs: top-level objects in EMOTIONS array — 4 spaces indent
const emotionIds = [...emotionsText.matchAll(/^    id: '([^']+)'/gm)].map(m => m[1]);
const seenEmotions = new Set();
for (const id of emotionIds) {
  if (seenEmotions.has(id)) fail(`Duplicate emotion id: '${id}'`);
  seenEmotions.add(id);
}
console.log(`Emotions: ${emotionIds.length} unique IDs ✓`);

// School IDs: 4-space indent inside SCHOOLS array
const schoolIds = [...schoolsText.matchAll(/^    id: '([^']+)'/gm)].map(m => m[1]);
// Lesson IDs: 8-space indent inside lessons array
const lessonIds = [...schoolsText.matchAll(/^        id: '([^']+)'/gm)].map(m => m[1]);

const seenLessons = new Set();
for (const id of lessonIds) {
  if (seenLessons.has(id)) fail(`Duplicate lesson id: '${id}'`);
  seenLessons.add(id);
}

console.log(`Schools: ${schoolIds.length} found`);
console.log(`Lessons: ${lessonIds.length} unique IDs ✓`);

if (schoolIds.length < 9)   fail(`Expected at least 9 schools, found ${schoolIds.length}`);
if (lessonIds.length < 100) fail(`Expected at least 100 lessons, found ${lessonIds.length}`);

if (failed) {
  process.exit(1);
} else {
  console.log('All invariants passed.');
}
