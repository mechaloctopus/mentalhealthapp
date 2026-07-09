// expo-sqlite database layer for MoodSignal v2.
// NOTE: imports from '../engine/voice' are safe — no circular dependency.
// Single file: schema definition, migrations, and typed query helpers.

import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!_db) throw new Error('DB not initialized — call initDb() first');
  return _db;
}

const MIGRATIONS: string[] = [
  // v1 — initial schema
  `CREATE TABLE IF NOT EXISTS checkins (
    id TEXT PRIMARY KEY,
    at INTEGER NOT NULL,
    emotion TEXT NOT NULL,
    valence REAL NOT NULL,
    arousal REAL NOT NULL,
    energy INTEGER,
    calmness INTEGER,
    stability INTEGER,
    stress TEXT,
    confidence REAL,
    voice_emotion TEXT,
    self_emotion TEXT,
    note TEXT,
    factors TEXT,
    source TEXT NOT NULL DEFAULT 'self',
    baseline_shift INTEGER DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY,
    at INTEGER NOT NULL,
    prompt TEXT,
    body TEXT NOT NULL,
    emotion TEXT,
    type TEXT NOT NULL DEFAULT 'free'
  )`,

  `CREATE TABLE IF NOT EXISTS quest_completions (
    id TEXT PRIMARY KEY,
    quest_id TEXT NOT NULL,
    completed_at INTEGER NOT NULL,
    emotion TEXT,
    notes TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS school_progress (
    school_id TEXT PRIMARY KEY,
    lessons_seen TEXT NOT NULL DEFAULT '[]',
    last_seen_at INTEGER
  )`,

  `CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
];

export async function initDb(): Promise<void> {
  const db = await SQLite.openDatabaseAsync('moodsignal.db');
  _db = db;

  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  for (let i = version; i < MIGRATIONS.length; i++) {
    await db.execAsync(MIGRATIONS[i]!);
    version = i + 1;
    await db.execAsync(`PRAGMA user_version = ${version}`);
  }
}

// ── CheckIn helpers ────────────────────────────────────────────────────────

export interface DbCheckIn {
  id: string;
  at: number;
  emotion: string;
  valence: number;
  arousal: number;
  energy: number | null;
  calmness: number | null;
  stability: number | null;
  stress: string | null;
  confidence: number | null;
  voice_emotion: string | null;
  self_emotion: string | null;
  note: string | null;
  factors: string | string[] | null;
  source: 'voice' | 'self';
  baseline_shift: number;
}

export async function saveCheckIn(c: DbCheckIn): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO checkins
      (id, at, emotion, valence, arousal, energy, calmness, stability,
       stress, confidence, voice_emotion, self_emotion, note, factors,
       source, baseline_shift)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    c.id, c.at, c.emotion, c.valence, c.arousal,
    c.energy, c.calmness, c.stability, c.stress, c.confidence,
    c.voice_emotion, c.self_emotion, c.note,
    Array.isArray(c.factors) ? JSON.stringify(c.factors) : (c.factors ?? null),
    c.source, c.baseline_shift,
  );
}

export async function getRecentCheckIns(limit = 30): Promise<DbCheckIn[]> {
  const db = getDb();
  return db.getAllAsync<DbCheckIn>(
    'SELECT * FROM checkins ORDER BY at DESC LIMIT ?',
    limit,
  );
}

export async function getCheckInsForPeriod(fromAt: number, toAt: number): Promise<DbCheckIn[]> {
  const db = getDb();
  return db.getAllAsync<DbCheckIn>(
    'SELECT * FROM checkins WHERE at >= ? AND at <= ? ORDER BY at ASC',
    fromAt, toAt,
  );
}

// ── Journal helpers ────────────────────────────────────────────────────────

export interface DbJournalEntry {
  id: string;
  at: number;
  prompt: string | null;
  body: string;
  emotion: string | null;
  type: 'free' | 'reflect' | 'gratitude';
}

export async function saveJournalEntry(e: DbJournalEntry): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO journal_entries (id, at, prompt, body, emotion, type)
     VALUES (?,?,?,?,?,?)`,
    e.id, e.at, e.prompt, e.body, e.emotion, e.type,
  );
}

export async function getRecentJournalEntries(limit = 20): Promise<DbJournalEntry[]> {
  const db = getDb();
  return db.getAllAsync<DbJournalEntry>(
    'SELECT * FROM journal_entries ORDER BY at DESC LIMIT ?',
    limit,
  );
}

// ── Quest completion helpers ───────────────────────────────────────────────

export async function saveQuestCompletion(
  questId: string,
  emotion?: string,
  notes?: string,
): Promise<void> {
  const db = getDb();
  await db.runAsync(
    `INSERT INTO quest_completions (id, quest_id, completed_at, emotion, notes)
     VALUES (?,?,?,?,?)`,
    Math.random().toString(36).slice(2),
    questId,
    Date.now(),
    emotion ?? null,
    notes ?? null,
  );
}

export async function getQuestCompletions(questId: string): Promise<number> {
  const db = getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM quest_completions WHERE quest_id = ?',
    questId,
  );
  return row?.count ?? 0;
}

// ── App meta helpers ───────────────────────────────────────────────────────

export async function setMeta(key: string, value: string): Promise<void> {
  const db = getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO app_meta (key, value) VALUES (?,?)',
    key, value,
  );
}

export async function getMeta(key: string): Promise<string | null> {
  const db = getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ?',
    key,
  );
  return row?.value ?? null;
}

// ── Quest completion count ─────────────────────────────────────────────────

export async function getAllQuestCompletionsCount(): Promise<number> {
  const db = getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM quest_completions',
  );
  return row?.count ?? 0;
}

// ── School progress helpers ────────────────────────────────────────────────

export async function getSchoolProgress(schoolId: string): Promise<string[]> {
  const db = getDb();
  const row = await db.getFirstAsync<{ lessons_seen: string }>(
    'SELECT lessons_seen FROM school_progress WHERE school_id = ?',
    schoolId,
  );
  if (!row) return [];
  try { return JSON.parse(row.lessons_seen) as string[]; } catch { return []; }
}

export async function markLessonSeen(schoolId: string, lessonId: string): Promise<void> {
  const db = getDb();
  const current = await getSchoolProgress(schoolId);
  if (current.includes(lessonId)) return;
  const updated = [...current, lessonId];
  await db.runAsync(
    `INSERT OR REPLACE INTO school_progress (school_id, lessons_seen, last_seen_at)
     VALUES (?, ?, ?)`,
    schoolId, JSON.stringify(updated), Date.now(),
  );
}

export async function getAllSchoolProgress(): Promise<Record<string, string[]>> {
  const db = getDb();
  const rows = await db.getAllAsync<{ school_id: string; lessons_seen: string }>(
    'SELECT school_id, lessons_seen FROM school_progress',
  );
  const result: Record<string, string[]> = {};
  for (const row of rows) {
    try { result[row.school_id] = JSON.parse(row.lessons_seen); } catch { /* skip */ }
  }
  return result;
}

// ── Resonance helpers ──────────────────────────────────────────────────────

export async function getResonanceTotal(): Promise<number> {
  const raw = await getMeta('resonance_total');
  return raw ? Number(raw) : 0;
}

export async function addResonance(amount: number): Promise<number> {
  const current = await getResonanceTotal();
  const next = current + amount;
  await setMeta('resonance_total', String(next));
  return next;
}

// ── Milestone helpers ──────────────────────────────────────────────────────

export async function getEarnedMilestoneIds(): Promise<string[]> {
  const raw = await getMeta('milestones_earned');
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

export async function earnMilestoneById(id: string): Promise<void> {
  const current = await getEarnedMilestoneIds();
  if (!current.includes(id)) {
    await setMeta('milestones_earned', JSON.stringify([...current, id]));
  }
}

// ── Baseline helpers ───────────────────────────────────────────────────────

export interface StoredBaseline {
  energy: number;
  calmness: number;
  stability: number;
  valence: number;
  arousal: number;
  capturedAt: number;
}

export async function saveBaseline(b: StoredBaseline): Promise<void> {
  await setMeta('baseline', JSON.stringify(b));
}

export async function getBaseline(): Promise<StoredBaseline | null> {
  const raw = await getMeta('baseline');
  if (!raw) return null;
  try { return JSON.parse(raw) as StoredBaseline; } catch { return null; }
}
