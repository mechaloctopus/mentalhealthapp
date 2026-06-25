export type WisdomTradition =
  | 'psychology'
  | 'stoic'
  | 'contemplative'
  | 'gospel-of-mary'
  | 'buddhist'
  | 'taoist'
  | 'frankl'
  | 'seven-habits'
  | 'flow'
  | 'purpose';

export type WisdomTone = 'secular' | 'spiritual' | 'christian' | 'philosophical' | 'science-forward' | 'poetic' | 'direct';

export interface WisdomEntry {
  id: string;
  title: string;
  body: string;
  action: string;
  tradition: WisdomTradition;
  tones: WisdomTone[];
  emotions: string[];
  virtues: string[];
  tags: string[];
  practiceRoute?: string;
}

export const WISDOM: WisdomEntry[] = [
  {
    id: 'breath-before-belief',
    title: 'Begin with the body',
    body: 'When the mind is racing, do not argue with every thought. First give the nervous system a slower rhythm.',
    action: 'Take three long exhales before deciding what the feeling means.',
    tradition: 'psychology',
    tones: ['secular', 'science-forward', 'direct'],
    emotions: ['anxious', 'overwhelmed', 'frustrated'],
    virtues: ['presence', 'patience'],
    tags: ['high-arousal', 'stress', 'regulation'],
    practiceRoute: '/breath',
  },
  {
    id: 'control-the-next-action',
    title: 'Return to what is yours',
    body: 'Not everything in this moment belongs to you. Your next honest action does.',
    action: 'Name one thing you can control in the next ten minutes and do only that.',
    tradition: 'stoic',
    tones: ['philosophical', 'direct', 'secular'],
    emotions: ['anxious', 'overwhelmed', 'frustrated'],
    virtues: ['discipline', 'courage'],
    tags: ['agency', 'control', 'decision'],
  },
  {
    id: 'inner-stillness-remains',
    title: 'The still center remains',
    body: 'A storm can move through awareness without becoming the whole of who you are.',
    action: 'Sit for one minute and silently repeat: this is moving through me; it is not all of me.',
    tradition: 'gospel-of-mary',
    tones: ['spiritual', 'christian', 'poetic'],
    emotions: ['sad', 'lonely', 'overwhelmed', 'anxious'],
    virtues: ['wisdom', 'presence'],
    tags: ['inner-stillness', 'identity', 'witness'],
    practiceRoute: '/stillness',
  },
  {
    id: 'purpose-through-care',
    title: 'Purpose begins with care',
    body: 'You do not need to solve your whole life right now. Look around. Something near you can be cared for.',
    action: 'Improve one small thing in your environment for two minutes.',
    tradition: 'purpose',
    tones: ['direct', 'secular', 'spiritual'],
    emotions: ['drained', 'sad', 'lonely', 'overwhelmed'],
    virtues: ['stewardship', 'discipline'],
    tags: ['purpose', 'stewardship', 'low-energy'],
  },
  {
    id: 'meaning-through-response',
    title: 'Meaning is in the response',
    body: 'You may not choose every condition, but you can choose the quality of your response.',
    action: 'Ask: what would a courageous response look like here, even if it is small?',
    tradition: 'frankl',
    tones: ['philosophical', 'direct', 'secular'],
    emotions: ['sad', 'frustrated', 'drained', 'overwhelmed'],
    virtues: ['courage', 'resilience'],
    tags: ['meaning', 'agency', 'suffering'],
  },
  {
    id: 'mushin-one-motion',
    title: 'One motion, no argument',
    body: 'Flow begins when attention stops commenting on the action and enters the action.',
    action: 'Choose one simple task and do it for five minutes without narrating yourself.',
    tradition: 'flow',
    tones: ['philosophical', 'direct', 'secular'],
    emotions: ['anxious', 'excited', 'frustrated', 'overwhelmed'],
    virtues: ['presence', 'discipline'],
    tags: ['mushin', 'flow', 'focus'],
  },
  {
    id: 'begin-with-end-in-mind',
    title: 'Choose the person first',
    body: 'Before choosing the task, choose the kind of person you want to be while doing it.',
    action: 'Finish this sentence: in the next hour, I will practice being _____.',
    tradition: 'seven-habits',
    tones: ['direct', 'secular'],
    emotions: ['drained', 'frustrated', 'excited', 'content'],
    virtues: ['discipline', 'wisdom', 'integrity'],
    tags: ['identity', 'intention', 'habits'],
  },
  {
    id: 'soften-the-circle',
    title: 'Widen the circle',
    body: 'Pain narrows attention. Kindness gently widens it again.',
    action: 'Bring to mind one person and wish them safety, steadiness, and peace.',
    tradition: 'buddhist',
    tones: ['spiritual', 'secular', 'poetic'],
    emotions: ['lonely', 'sad', 'frustrated', 'grateful'],
    virtues: ['compassion', 'patience'],
    tags: ['loving-kindness', 'connection', 'softening'],
    practiceRoute: '/meta',
  },
  {
    id: 'do-not-force-the-river',
    title: 'Do not force the river',
    body: 'Some states settle by being allowed, not conquered.',
    action: 'Stop pushing for one minute. Let the breath arrive and leave on its own.',
    tradition: 'taoist',
    tones: ['poetic', 'philosophical', 'secular'],
    emotions: ['anxious', 'frustrated', 'overwhelmed', 'calm'],
    virtues: ['patience', 'presence'],
    tags: ['non-forcing', 'allowing', 'breath'],
    practiceRoute: '/stillness',
  },
  {
    id: 'gratitude-lands-the-good',
    title: 'Let the good land',
    body: 'Pleasant states pass quickly when we rush past them. Let this one register.',
    action: 'Name one good thing and feel it in the body for ten seconds.',
    tradition: 'psychology',
    tones: ['science-forward', 'secular', 'direct'],
    emotions: ['joy', 'grateful', 'content', 'proud', 'calm'],
    virtues: ['gratitude', 'presence'],
    tags: ['savoring', 'positive', 'integration'],
  },
];

export function wisdomForEmotion(emotionId: string): WisdomEntry[] {
  const exact = WISDOM.filter((w) => w.emotions.includes(emotionId));
  return exact.length ? exact : WISDOM.filter((w) => w.emotions.includes('calm'));
}

export function pickWisdom(emotionId: string, seed = Date.now()): WisdomEntry {
  const list = wisdomForEmotion(emotionId);
  return list[Math.abs(seed) % list.length];
}
