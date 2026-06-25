export interface PurposePrompt {
  id: string;
  title: string;
  body: string;
  action: string;
  minutes: number;
  context: string[];
  emotions: string[];
  virtues: string[];
}

export const PURPOSE_PROMPTS: PurposePrompt[] = [
  {
    id: 'care-for-space',
    title: 'Care for the space',
    body: 'Purpose can begin as stewardship over the place you are standing.',
    action: 'Find one small thing in your environment and make it better for two minutes.',
    minutes: 2,
    context: ['home', 'work', 'room', 'anywhere'],
    emotions: ['drained', 'sad', 'lonely', 'overwhelmed'],
    virtues: ['stewardship', 'discipline'],
  },
  {
    id: 'help-one-person',
    title: 'Become useful nearby',
    body: 'When purpose feels far away, usefulness is often close.',
    action: 'Send one helpful or encouraging message to someone specific.',
    minutes: 3,
    context: ['anywhere'],
    emotions: ['lonely', 'sad', 'drained', 'content'],
    virtues: ['service', 'compassion'],
  },
  {
    id: 'body-stewardship',
    title: 'Steward the body',
    body: 'Your body is part of the environment you are responsible for today.',
    action: 'Drink water, loosen your shoulders, and take five slow breaths.',
    minutes: 2,
    context: ['anywhere'],
    emotions: ['anxious', 'overwhelmed', 'drained', 'frustrated'],
    virtues: ['stewardship', 'presence'],
  },
  {
    id: 'repair-one-thing',
    title: 'Repair one small thing',
    body: 'A repaired object can remind the mind that order can return gradually.',
    action: 'Fix, sort, fold, wipe, or put away one visible thing.',
    minutes: 5,
    context: ['home', 'work', 'room'],
    emotions: ['frustrated', 'overwhelmed', 'drained'],
    virtues: ['discipline', 'stewardship'],
  },
  {
    id: 'notice-life',
    title: 'Notice what is alive',
    body: 'Attention to life interrupts the trance of isolation.',
    action: 'Step outside or look out a window and notice one living thing carefully.',
    minutes: 2,
    context: ['outside', 'home', 'work', 'anywhere'],
    emotions: ['lonely', 'sad', 'anxious', 'calm'],
    virtues: ['presence', 'gratitude'],
  },
];

export function purposeForEmotion(emotionId: string): PurposePrompt[] {
  const exact = PURPOSE_PROMPTS.filter((p) => p.emotions.includes(emotionId));
  return exact.length ? exact : PURPOSE_PROMPTS;
}

export function pickPurposePrompt(emotionId: string, seed = Date.now()): PurposePrompt {
  const list = purposeForEmotion(emotionId);
  return list[Math.abs(seed) % list.length];
}
