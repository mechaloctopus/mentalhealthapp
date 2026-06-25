// Reflective journaling prompts, lightly themed by emotion valence.
import { getEmotion } from './emotions';

const GENERAL = [
  'What is asking for your attention today?',
  'Name one thing you are carrying that you could set down.',
  'What did your body need today — did it get it?',
  'Describe this moment as if writing to a kind friend.',
  'What is one small thing that went right today?',
  'If today had a title, what would it be?',
  'What would “enough” look like for the rest of today?',
];

const HARD = [
  'What feels heaviest right now, in plain words?',
  'What would comfort look like in the next ten minutes?',
  'What is one thing that is still okay, even now?',
  'Whom could you reach out to, even briefly?',
  'What would you say to a friend feeling exactly this?',
];

const GOOD = [
  'What made this feeling possible today?',
  'How could you make a little more room for this tomorrow?',
  'Who or what are you quietly grateful for right now?',
  'What strength did you use today without noticing?',
];

export function promptsFor(emotionId?: string): string[] {
  if (!emotionId) return GENERAL;
  const e = getEmotion(emotionId);
  if (e.valence < -0.2) return [...HARD, ...GENERAL];
  if (e.valence > 0.3) return [...GOOD, ...GENERAL];
  return GENERAL;
}

export function randomPrompt(emotionId?: string): string {
  const pool = promptsFor(emotionId);
  return pool[Math.floor(Math.random() * pool.length)];
}
