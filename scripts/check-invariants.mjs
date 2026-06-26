import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yml', '.yaml']);
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

function extension(path) {
  const index = path.lastIndexOf('.');
  return index === -1 ? '' : path.slice(index);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git' || name === '.expo') continue;
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (TEXT_EXTENSIONS.has(extension(full))) out.push(full);
  }
  return out;
}

function rel(path) {
  return path.replace(ROOT + '/', '');
}

function read(path) {
  return readFileSync(path, 'utf8');
}

const files = walk(ROOT);
const failures = [];

function fail(message) {
  failures.push(message);
}

function assertFileMissing(path) {
  if (existsSync(join(ROOT, path))) fail(`${path} should not exist`);
}

function assertNoPattern(pattern, message, allow = []) {
  for (const file of files) {
    const path = rel(file);
    if (allow.includes(path)) continue;
    if (pattern.test(read(file))) fail(`${message}: ${path}`);
  }
}

function assertNoPatternInSource(pattern, message, allow = []) {
  for (const file of files) {
    const path = rel(file);
    if (!SOURCE_EXTENSIONS.has(extension(file))) continue;
    if (allow.includes(path)) continue;
    if (pattern.test(read(file))) fail(`${message}: ${path}`);
  }
}

function assertFileContains(path, pattern, message) {
  const full = join(ROOT, path);
  if (!existsSync(full)) {
    fail(`${path} is missing`);
    return;
  }
  if (!pattern.test(read(full))) fail(message);
}

assertFileMissing('src/components/Companion.tsx');
assertFileMissing('src/lib/progress.ts');

assertNoPatternInSource(/computeProgress|Companion/i, 'obsolete Lumen progression reference found', [
  'scripts/check-invariants.mjs',
]);
assertNoPattern(/cancelAllScheduledNotificationsAsync/, 'broad notification cancellation found');
assertNoPattern(/fake|simulated|seeded/i, 'possible simulated production signal found', [
  'scripts/check-invariants.mjs',
  'docs/COHERENCE_AUDIT.md',
  'docs/PRIVACY_ARCHITECTURE.md',
  'docs/ROADMAP.md',
  'docs/REPO_AUDIT.md',
  'README.md',
]);

assertFileContains('src/lib/voice.ts', /return null;/, 'voice analyzer should reject unusable samples');
assertFileContains('src/lib/voice.ts', /voiceSampleQuality/, 'voice sample quality function is required');
assertFileContains('src/side/SideContext.tsx', /CORE_PRACTICE_REWARDS/, 'core practice rewards should be centralized');
assertFileContains('src/lib/dataInventory.ts', /DATA_INVENTORY/, 'typed data inventory should exist');
assertFileContains('docs/PRIVACY_ARCHITECTURE.md', /local-only encrypted/i, 'privacy architecture should document the recommended v1 path');
assertFileContains('docs/MANUAL_QA.md', /Release build checks/, 'manual QA checklist should include release build checks');

if (failures.length) {
  console.error('\nInvariant check failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Repository invariants passed.');
