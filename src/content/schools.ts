// Schools of Thought — the wisdom layer for MoodSignal v2.
// Each school is a self-contained philosophical tradition that maps to
// particular emotions, virtues, and recommended practices.

export type SchoolId =
  | 'stoicism'
  | 'buddhism'
  | 'taoism'
  | 'positive-psychology'
  | 'logotherapy'
  | 'contemplative'
  | 'flow'
  | 'purpose';

export interface SchoolLesson {
  id: string;
  title: string;
  body: string;
  action: string;
  practiceRoute?: string;
}

export interface School {
  id: SchoolId;
  name: string;
  tagline: string;
  color: string;
  description: string;
  coreVirtues: string[];
  resonantEmotions: string[];   // emotion ids this school speaks to
  lessons: SchoolLesson[];
}

export const SCHOOLS: School[] = [
  {
    id: 'stoicism',
    name: 'Stoicism',
    tagline: 'Control what is yours.',
    color: '#7db9ff',
    description: 'The Stoics taught that tranquility comes not from changing circumstances but from distinguishing what is within our power from what is not, and acting accordingly.',
    coreVirtues: ['wisdom', 'courage', 'justice', 'temperance'],
    resonantEmotions: ['stress', 'anger', 'anxiety', 'focus', 'confidence'],
    lessons: [
      {
        id: 'stoic-dichotomy',
        title: 'Return to what is yours',
        body: 'Not everything in this moment belongs to you. Your next honest action does. The Stoics called this the dichotomy of control — the foundation of all equanimity.',
        action: 'Name one thing you can control in the next ten minutes. Do only that.',
        practiceRoute: '/(branches)/journal/reflect',
      },
      {
        id: 'stoic-obstacle',
        title: 'The obstacle is the way',
        body: 'Marcus Aurelius wrote that what stands in the way becomes the way. Difficulty is not an interruption — it is the practice itself.',
        action: 'Name one current obstacle. Ask how it could become the path forward.',
        practiceRoute: '/(branches)/journal/reflect',
      },
      {
        id: 'stoic-momento',
        title: 'Remember it will end',
        body: 'Memento mori — remembering that time is finite — is not morbid but clarifying. It reveals what actually matters.',
        action: 'Ask: if this were my last week, what would I stop doing? What would I start?',
      },
      {
        id: 'stoic-morning',
        title: 'Set the day\'s intention',
        body: 'The Stoic morning review: what virtues do I intend to practice today? What difficulty might I meet, and how will I respond?',
        action: 'Name one virtue and one anticipated difficulty. Decide your response now.',
        practiceRoute: '/(branches)/journal/write',
      },
      {
        id: 'stoic-virtue',
        title: 'Virtue is its own reward',
        body: 'The Stoics held that virtue — excellence of character — is the only genuine good. Everything else is preferred but not required for flourishing.',
        action: 'Do one thing today for its own quality, not for any outcome.',
      },
    ],
  },
  {
    id: 'buddhism',
    name: 'Buddhism',
    tagline: 'Meet what is here with openness.',
    color: '#f0bd67',
    description: 'Buddhist psychology offers tools for working with the mind directly — noting, equanimity, and compassion. The path is not toward a fixed self but toward freedom from suffering.',
    coreVirtues: ['mindfulness', 'compassion', 'equanimity', 'wisdom'],
    resonantEmotions: ['sadness', 'anxiety', 'anger', 'calm', 'gratitude', 'connection'],
    lessons: [
      {
        id: 'buddhist-impermanence',
        title: 'This too is changing',
        body: 'The first mark of existence in Buddhist teaching is impermanence. No state — pleasant or unpleasant — is permanent. This is liberating.',
        action: 'Notice one current feeling and say silently: this is moving through me; it is not all of me.',
        practiceRoute: '/(branches)/practices/stillness',
      },
      {
        id: 'buddhist-noting',
        title: 'Note without commentary',
        body: 'Noting practice trains the observer: you see a thought, note "thinking," and return. The return is the practice, not a failure.',
        action: 'Sit for three minutes. Note each thought with a simple word: "planning," "worrying," "remembering." Then return.',
        practiceRoute: '/(branches)/practices/stillness',
      },
      {
        id: 'buddhist-metta',
        title: 'Widen the circle of kindness',
        body: 'Loving-kindness (metta) begins with self, extends to those we love, then to strangers, and finally to those who are difficult. Each expansion softens the heart.',
        action: 'Say silently: May I be well. May those I love be well. May all beings be well.',
        practiceRoute: '/(branches)/practices/loving-kindness',
      },
      {
        id: 'buddhist-no-mud',
        title: 'No mud, no lotus',
        body: 'Thich Nhat Hanh taught that lotus flowers grow in mud. Suffering is not an obstacle to peace — it is the ground from which peace grows.',
        action: 'Name one difficulty and ask what it has been teaching you.',
      },
      {
        id: 'buddhist-anchor',
        title: 'Return to the breath',
        body: 'The breath is always available as a home base. Every moment of distraction can be followed by a moment of return.',
        action: 'Take ten breaths, counting on the exhale. Start over if you lose count.',
        practiceRoute: '/(branches)/practices/breath',
      },
    ],
  },
  {
    id: 'taoism',
    name: 'Taoism',
    tagline: 'Flow with what is.',
    color: '#66e0ca',
    description: 'The Tao Te Ching teaches that the highest good is like water — yielding, formless, nourishing. Wu wei, or effortless action, means aligning with the natural flow rather than forcing.',
    coreVirtues: ['simplicity', 'patience', 'humility', 'naturalness'],
    resonantEmotions: ['stress', 'anger', 'calm', 'focus', 'energy'],
    lessons: [
      {
        id: 'taoist-water',
        title: 'Be like water',
        body: 'Water is the softest substance and yet it carves through stone. Bruce Lee distilled this: be like water. Adapt to the shape of each moment.',
        action: 'Flow around one obstacle instead of forcing it. Find the path of least resistance.',
      },
      {
        id: 'taoist-wu-wei',
        title: 'Act without forcing',
        body: 'Wu wei is not passivity but right action — doing what is natural to the moment, without strain or striving. The tree bends in the storm and survives.',
        action: 'Identify one area where you are straining. Ask what a lighter touch would look like.',
      },
      {
        id: 'taoist-empty',
        title: 'The usefulness of emptiness',
        body: "Lao Tzu wrote: a wheel's usefulness is the empty hub. A room's usefulness is empty space. Emptiness is not lack — it is capacity.",
        action: 'Clear one small space — physical or mental — and sit in the openness for two minutes.',
        practiceRoute: '/(branches)/practices/stillness',
      },
      {
        id: 'taoist-enough',
        title: 'Knowing when enough is enough',
        body: 'The Tao Te Ching: "To know when to stop is to avoid danger." Contentment is the greatest wealth. Enough is a feast.',
        action: 'Identify one area of "more" in your life. Ask if less might be better.',
      },
      {
        id: 'taoist-return',
        title: 'Return to the root',
        body: 'The Taoist concept of pu — the uncarved block — suggests that simplicity and directness are closer to the source than complexity.',
        action: 'Simplify one thing in your day to its most essential form.',
      },
    ],
  },
  {
    id: 'positive-psychology',
    name: 'Positive Psychology',
    tagline: 'Build what flourishing looks like.',
    color: '#9fc16f',
    description: 'Positive psychology (Seligman, Csikszentmihalyi) studies wellbeing scientifically — what makes life worth living, not just what removes illness. PERMA: Positive emotion, Engagement, Relationships, Meaning, Achievement.',
    coreVirtues: ['gratitude', 'strengths', 'resilience', 'connection'],
    resonantEmotions: ['joy', 'gratitude', 'hope', 'confidence', 'connection', 'sadness'],
    lessons: [
      {
        id: 'pospsych-three-good',
        title: 'Three good things',
        body: 'Writing three good things each evening — and why they happened — rewires the brain toward benefit-finding. In studies, this single practice reduced depression significantly.',
        action: 'Write three good things from today and a one-sentence explanation for each.',
        practiceRoute: '/(branches)/journal/reflect',
      },
      {
        id: 'pospsych-strengths',
        title: 'Use your strengths',
        body: 'Seligman found that using signature strengths in new ways produces lasting increases in wellbeing. You are energized when using what you do naturally well.',
        action: 'Name your top strength. Find one way to use it in the next twenty-four hours.',
        practiceRoute: '/(branches)/journal/reflect',
      },
      {
        id: 'pospsych-flow',
        title: 'Find your flow conditions',
        body: 'Flow (Csikszentmihalyi) occurs when challenge and skill are balanced. It requires clear goals, immediate feedback, and full absorption.',
        action: 'Design one task to be slightly more challenging than comfortable. Begin it now.',
        practiceRoute: '/(branches)/journey/quest',
      },
      {
        id: 'pospsych-gratitude-letter',
        title: 'Write a gratitude letter',
        body: 'The gratitude visit — writing a detailed letter to someone who helped you and reading it aloud to them — is one of the most powerful wellbeing interventions known.',
        action: 'Write three sentences of genuine thanks to someone specific.',
        practiceRoute: '/(branches)/journal/write',
      },
      {
        id: 'pospsych-perma',
        title: 'Tend your PERMA',
        body: 'PERMA: Positive emotion, Engagement, Relationships, Meaning, Achievement. Flourishing requires all five. Check which is lowest right now.',
        action: 'Rate each PERMA element from 1–5. Take one small action on the lowest.',
      },
    ],
  },
  {
    id: 'logotherapy',
    name: 'Logotherapy',
    tagline: 'Find meaning in what is here.',
    color: '#b6a7ff',
    description: 'Viktor Frankl developed logotherapy in Auschwitz. His finding: those who survived found meaning even in suffering. We cannot always choose our circumstances but we can choose our response.',
    coreVirtues: ['meaning', 'responsibility', 'courage', 'love'],
    resonantEmotions: ['sadness', 'hope', 'anxiety', 'stress', 'connection'],
    lessons: [
      {
        id: 'logo-response',
        title: 'The space between',
        body: '"Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom." — Viktor Frankl',
        action: 'Find the space before your next reaction. Use it once today.',
      },
      {
        id: 'logo-meaning',
        title: 'Meaning in suffering',
        body: 'Frankl: "When we can no longer change a situation, we are challenged to change ourselves." Suffering that has meaning can be borne; suffering without meaning cannot.',
        action: 'Name one current difficulty. Ask: what response would give it meaning?',
        practiceRoute: '/(branches)/journal/reflect',
      },
      {
        id: 'logo-purpose-through-care',
        title: 'Purpose through care',
        body: 'You do not need to solve your whole life right now. Look around. Something near you can be cared for. Purpose begins here.',
        action: 'Improve one small thing in your immediate environment for two minutes.',
      },
      {
        id: 'logo-dereflection',
        title: 'Stop trying to be happy',
        body: 'Frankl observed that happiness cannot be pursued directly — it ensues from meaning. Turn your attention from your own state toward something or someone else.',
        action: 'Do one thing for another person today without any expectation of return.',
      },
      {
        id: 'logo-legacy',
        title: 'What would I regret not doing?',
        body: 'The existential question is not "what do I want?" but "what would I regret not having done?" The answer points toward genuine responsibility.',
        action: 'Name one thing you would regret not doing. Take one step toward it today.',
        practiceRoute: '/(branches)/journal/write',
      },
    ],
  },
  {
    id: 'contemplative',
    name: 'Contemplative',
    tagline: 'Be still and know.',
    color: '#f5c451',
    description: 'The Christian contemplative tradition — Meister Eckhart, Thomas Merton, Centering Prayer — teaches that beneath all thought and feeling there is a still center that can be rested in. Stillness is not emptiness but presence.',
    coreVirtues: ['surrender', 'presence', 'mercy', 'gratitude'],
    resonantEmotions: ['calm', 'sadness', 'gratitude', 'connection', 'hope', 'anxiety'],
    lessons: [
      {
        id: 'cont-still-center',
        title: 'The still center remains',
        body: 'A storm can move through awareness without becoming the whole of who you are. The inner still point is always available beneath the weather of thought and feeling.',
        action: 'Sit for one minute and silently repeat: this is moving through me; it is not all of me.',
        practiceRoute: '/(branches)/practices/stillness',
      },
      {
        id: 'cont-mercy',
        title: 'Begin with mercy',
        body: 'The contemplative tradition begins not with achievement but with mercy — receiving it, and extending it. Begin with mercy, especially toward yourself.',
        action: 'Offer yourself one sentence of mercy, out loud or within.',
      },
      {
        id: 'cont-gratitude-prayer',
        title: 'Gratitude as prayer',
        body: 'Gratitude is a prayer the body already knows. It does not require a formal posture — only a moment of honest thanks for what is.',
        action: 'Name three small mercies from the last twenty-four hours.',
        practiceRoute: '/(branches)/journal/reflect',
      },
      {
        id: 'cont-surrender',
        title: 'Surrender the outcome',
        body: 'Centering Prayer teaches consent — not striving, not analyzing, but releasing. "Not my will but thine" is the quietest form of courage.',
        action: 'Name one outcome you have been gripping. Set it down for the next hour.',
      },
      {
        id: 'cont-presence',
        title: 'Practice simple presence',
        body: 'Brother Lawrence practiced the presence of God by turning each small action — even washing dishes — into an act of devotion. Any moment can be consecrated.',
        action: 'Do one ordinary task — slowly, on purpose, as an act of care.',
      },
    ],
  },
  {
    id: 'flow',
    name: 'Flow & Craft',
    tagline: 'Enter the work completely.',
    color: '#ff9d5c',
    description: 'Mihaly Csikszentmihalyi identified flow as optimal experience — total absorption in a challenging activity. Cal Newport\'s deep work extends this: the ability to focus without distraction is the defining skill of our era.',
    coreVirtues: ['focus', 'craft', 'discipline', 'presence'],
    resonantEmotions: ['focus', 'energy', 'joy', 'confidence', 'stress'],
    lessons: [
      {
        id: 'flow-conditions',
        title: 'Design the conditions for flow',
        body: 'Flow requires: clear goals, immediate feedback, and a challenge matched to skill. None of these happen automatically. You must design for them.',
        action: 'Before your next work session, write: what is the goal? How will I know when I\'m done? Is this the right difficulty?',
      },
      {
        id: 'flow-single-task',
        title: 'One thing at a time',
        body: 'Multitasking is not a speed-up — it is a switch-cost. Deep focus on one thing produces more, in less time, with less residue.',
        action: 'Close everything except what you are doing now. Work for twenty minutes without switching.',
        practiceRoute: '/(branches)/journey/quest',
      },
      {
        id: 'flow-mushin',
        title: 'Enter action without commentary',
        body: 'The Zen concept of mushin (no-mind) describes action without internal narration. Flow begins when attention stops commenting on the action and enters it.',
        action: 'Choose one simple task. Do it for five minutes without narrating yourself.',
      },
      {
        id: 'flow-rest',
        title: 'Protect deep recovery',
        body: 'Cal Newport: downtime is not wasted time. The unconscious continues to work on problems during rest. Recovery is part of the performance.',
        action: 'Schedule one thirty-minute block of complete rest in your day. No screens.',
      },
      {
        id: 'flow-craft',
        title: 'Do the work for the work\'s sake',
        body: 'The craftsperson is not attached to outcome — only to the quality of this particular motion. Excellence is in the doing, not the result.',
        action: 'Bring your full attention to the quality of one thing you are doing right now.',
      },
    ],
  },
  {
    id: 'purpose',
    name: 'Purpose & Service',
    tagline: 'Live toward something larger.',
    color: '#ef786c',
    description: 'Research shows that people who orient toward contribution — to others, to a cause, to craft — report deeper wellbeing than those oriented primarily toward self. Purpose is not found, it is built through action.',
    coreVirtues: ['service', 'integrity', 'stewardship', 'contribution'],
    resonantEmotions: ['hope', 'sadness', 'gratitude', 'energy', 'connection'],
    lessons: [
      {
        id: 'purpose-ikigai',
        title: 'Where need and gift meet',
        body: 'The Japanese concept of ikigai — reason for being — lives at the intersection of what you love, what you are good at, what the world needs, and what you can be paid for.',
        action: 'Name one thing that touches at least two of these four. Do something small in that direction.',
      },
      {
        id: 'purpose-contribution',
        title: 'Make something better',
        body: 'Purpose does not require a grand mission. It requires a genuine orientation toward making something — a moment, a person, a project — better than you found it.',
        action: 'Improve one small thing in your environment or someone\'s experience today.',
      },
      {
        id: 'purpose-stewardship',
        title: 'Care for what is in your keeping',
        body: 'Stewardship is the quiet form of purpose — caring well for what has been entrusted to you, whether a person, a body, a skill, or a responsibility.',
        action: 'Name one thing in your care that deserves more attention. Give it that attention for five minutes.',
      },
      {
        id: 'purpose-legacy',
        title: 'Begin with the end in mind',
        body: 'Stephen Covey: "Begin with the end in mind." Imagine your life as a story being written. What do you want the story to be about? Then live backward from that.',
        action: 'Write three sentences describing how you want to be remembered.',
        practiceRoute: '/(branches)/journal/write',
      },
      {
        id: 'purpose-next-step',
        title: 'The mission review',
        body: 'Purpose is made real one decision at a time. Review your current commitments against your stated mission. Prune what does not serve it. Deepen what does.',
        action: 'List three current commitments. Mark each: aligned / uncertain / misaligned. Act on one.',
      },
    ],
  },
];

export const SCHOOL_BY_ID: Record<string, School> = Object.fromEntries(
  SCHOOLS.map((s) => [s.id, s])
);

export function getSchool(id: string | undefined | null): School {
  return (id && SCHOOL_BY_ID[id]) || SCHOOLS[0]!;
}

export function schoolsForEmotion(emotionId: string): School[] {
  return SCHOOLS.filter((s) => s.resonantEmotions.includes(emotionId));
}
