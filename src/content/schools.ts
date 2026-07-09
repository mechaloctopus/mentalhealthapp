export type SchoolId =
  | 'five-temples'
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
  resonantEmotions: string[];
  lessons: SchoolLesson[];
  featured?: boolean;
}

export const SCHOOLS: School[] = [
  // ── The Five Temples — primary path (Gospel of Mary / contemplative inner tradition) ──
  {
    id: 'five-temples',
    name: 'The Five Temples',
    tagline: 'Walk the inner way toward wholeness.',
    color: '#b15fb0',
    featured: true,
    description: 'Five inner temples guide the soul\'s return to itself — through truth, self-knowledge, liberation, inner mastery, and union. An ancient path of inner transformation that requires no creed, only honest attention.',
    coreVirtues: ['truth', 'knowing', 'liberation', 'mastery', 'union'],
    resonantEmotions: ['calm', 'sadness', 'anxiety', 'hope', 'connection', 'gratitude'],
    lessons: [
      {
        id: 'temple-truth',
        title: 'The First Temple — Truth',
        body: 'The truth lives within you — not as doctrine handed down from outside, but as direct knowing that the soul recognizes when it is still enough to listen. You do not need an intermediary to know what is real.',
        action: 'Sit in quiet for three minutes. Ask: what do I actually know to be true right now, beneath opinion and fear? Write it plainly.',
        practiceRoute: '/(branches)/journal/write',
      },
      {
        id: 'temple-self-knowledge',
        title: 'The Second Temple — Self-Knowledge',
        body: 'To know yourself is the beginning of all inner work. Not the image others hold of you, not the story you have told yourself — but the quiet facts of who you actually are. Look without flinching.',
        action: 'Name one thing you have been avoiding seeing about yourself. Write it plainly, without judgment or commentary.',
        practiceRoute: '/(branches)/journal/write',
      },
      {
        id: 'temple-liberation',
        title: 'The Third Temple — Liberation',
        body: 'The soul carries weights it did not choose: patterns of fear, inherited beliefs, the gravity of old wounds. Liberation begins not with force but with seeing — clearly enough that these powers lose their hold.',
        action: 'Name one belief or pattern that is not truly yours — given to you by fear or circumstance. Acknowledge its presence, then acknowledge: you are not it.',
        practiceRoute: '/(branches)/practices/stillness',
      },
      {
        id: 'temple-inner-mastery',
        title: 'The Fourth Temple — Inner Mastery',
        body: 'The soul that knows itself cannot be dominated by what is outside it. Inner mastery is not suppression — it is the center holding while the storm passes. You are larger than what you feel in this moment.',
        action: 'Notice one strong feeling right now. Without acting on it or pushing it away, simply witness it as a visitor. The one who watches is not the storm.',
        practiceRoute: '/(branches)/practices/stillness',
      },
      {
        id: 'temple-union',
        title: 'The Fifth Temple — Union',
        body: 'The journey of the soul ends not in a distant heaven but in return — to the source that was never truly absent. What was scattered finds its wholeness again. Rest is not distance from life but fullness within it.',
        action: 'Take five slow, full breaths. With each exhale, release one thing you have been carrying. With each inhale, receive what is already here.',
        practiceRoute: '/(branches)/practices/breath',
      },
    ],
  },

  // ── The Unshaken (inner Stoic tradition — control, virtue, equanimity) ──
  {
    id: 'stoicism',
    name: 'The Unshaken',
    tagline: 'Anchor what is truly yours.',
    color: '#7db9ff',
    description: 'Some things belong to you — your attention, your response, your next honest action. Everything else is weather. Learning this distinction is the foundation of all equanimity.',
    coreVirtues: ['wisdom', 'courage', 'justice', 'temperance'],
    resonantEmotions: ['stress', 'anger', 'anxiety', 'focus', 'confidence'],
    lessons: [
      {
        id: 'stoic-dichotomy',
        title: 'Return to what is yours',
        body: 'Not everything in this moment belongs to you. Your next honest action does. There is a distinction between what is within your power and what is not — and finding it is the foundation of all calm.',
        action: 'Name one thing you can control in the next ten minutes. Do only that.',
        practiceRoute: '/(branches)/journal/reflect',
      },
      {
        id: 'stoic-obstacle',
        title: 'The obstacle is the way',
        body: 'What stands in the way becomes the way. Difficulty is not an interruption of the practice — it is the practice itself. The resistance you meet is exactly the weight you need.',
        action: 'Name one current obstacle. Ask how it could become the path forward.',
        practiceRoute: '/(branches)/journal/reflect',
      },
      {
        id: 'stoic-momento',
        title: 'Remember it will end',
        body: 'Remembering that time is finite is not morbid — it is clarifying. It reveals what actually matters and strips away what only seemed urgent.',
        action: 'Ask: if this were my last week, what would I stop doing? What would I start?',
      },
      {
        id: 'stoic-morning',
        title: 'Set the day\'s intention',
        body: 'The morning review: what virtues do I intend to practice today? What difficulty might I meet, and how will I respond? The day you prepare for is the day you live.',
        action: 'Name one virtue and one anticipated difficulty. Decide your response now.',
        practiceRoute: '/(branches)/journal/write',
      },
      {
        id: 'stoic-virtue',
        title: 'Excellence is its own reward',
        body: 'The only genuine good is excellence of character — not as a means to an outcome, but as the way of moving through the world. Do one thing today for the quality of the doing, not the result.',
        action: 'Do one thing today for its own quality, not for any outcome.',
      },
    ],
  },

  // ── The Open Field (Buddhist psychology — presence, compassion, impermanence) ──
  {
    id: 'buddhism',
    name: 'The Open Field',
    tagline: 'Meet what arrives without armor.',
    color: '#f0bd67',
    description: 'What if you could meet each experience — pleasant or painful — without adding a story to it? The open field is the practice of seeing clearly, with compassion, and returning again and again.',
    coreVirtues: ['mindfulness', 'compassion', 'equanimity', 'wisdom'],
    resonantEmotions: ['sadness', 'anxiety', 'anger', 'calm', 'gratitude', 'connection'],
    lessons: [
      {
        id: 'buddhist-impermanence',
        title: 'This too is changing',
        body: 'No state — pleasant or unpleasant — is permanent. The feeling moving through you now is already in motion. This is not consolation; it is the actual nature of experience.',
        action: 'Notice one current feeling and say silently: this is moving through me. It is not all of me.',
        practiceRoute: '/(branches)/practices/stillness',
      },
      {
        id: 'buddhist-noting',
        title: 'Note without commentary',
        body: 'You see a thought, note it with a simple word — "planning," "worrying," "remembering" — and return to the breath. The return is the practice, not the failure to stay.',
        action: 'Sit for three minutes. Note each thought with a single word. Then return to the breath.',
        practiceRoute: '/(branches)/practices/stillness',
      },
      {
        id: 'buddhist-metta',
        title: 'Widen the circle of kindness',
        body: 'Loving-kindness begins with yourself, extends to those you love, then to strangers, and finally to those who are difficult. Each expansion softens the armor around the heart.',
        action: 'Say silently: May I be well. May those I love be well. May all beings be well.',
        practiceRoute: '/(branches)/practices/loving-kindness',
      },
      {
        id: 'buddhist-no-mud',
        title: 'No mud, no lotus',
        body: 'The lotus grows from mud. Suffering is not an obstacle to peace — it is the ground from which peace grows. You do not need different circumstances to begin.',
        action: 'Name one difficulty and ask: what has it been quietly teaching me?',
      },
      {
        id: 'buddhist-anchor',
        title: 'Return to the breath',
        body: 'The breath is always available as a home base. Every moment of distraction — every one — can be followed by a moment of return. The return is what builds the practice.',
        action: 'Take ten breaths, counting on the exhale. Start over if you lose count.',
        practiceRoute: '/(branches)/practices/breath',
      },
    ],
  },

  // ── The Current (Taoist philosophy — flow, naturalness, wu wei) ──
  {
    id: 'taoism',
    name: 'The Current',
    tagline: 'Move with what is already flowing.',
    color: '#66e0ca',
    description: 'Water is the softest substance and yet it carves through stone. The current teaches that aligning with what is natural — rather than forcing — is the highest form of intelligence.',
    coreVirtues: ['simplicity', 'patience', 'humility', 'naturalness'],
    resonantEmotions: ['stress', 'anger', 'calm', 'focus', 'energy'],
    lessons: [
      {
        id: 'taoist-water',
        title: 'Be like water',
        body: 'Water adapts to any vessel, finds the path of least resistance, and in doing so shapes stone over time. The softest thing overcomes the hardest. Adapt to the shape of this moment.',
        action: 'Flow around one obstacle instead of forcing it. Find the path of least resistance today.',
      },
      {
        id: 'taoist-wu-wei',
        title: 'Act without forcing',
        body: 'There is a kind of action that is not striving — doing what is natural to the moment, without strain. The tree bends in the storm and survives where the rigid oak snaps.',
        action: 'Identify one area where you are straining. Ask what a lighter touch would look like.',
      },
      {
        id: 'taoist-empty',
        title: 'The usefulness of emptiness',
        body: 'A wheel\'s usefulness is the empty hub. A room\'s usefulness is the open space inside. Emptiness is not lack — it is capacity. What could you empty to create more room?',
        action: 'Clear one small space — physical or mental — and sit in the openness for two minutes.',
        practiceRoute: '/(branches)/practices/stillness',
      },
      {
        id: 'taoist-enough',
        title: 'Knowing when enough is enough',
        body: 'To know when to stop is wisdom. Contentment is the greatest wealth — not because it means giving up, but because it means you have arrived at what already is.',
        action: 'Identify one area of "more" in your life. Ask honestly if less might be better.',
      },
      {
        id: 'taoist-return',
        title: 'Return to the root',
        body: 'The uncarved block is closer to the source than the elaborate finished thing. Simplicity and directness are not primitives — they are the highest refinement.',
        action: 'Simplify one thing in your day to its most essential form.',
      },
    ],
  },

  // ── The Garden (Positive psychology — flourishing, strengths, gratitude) ──
  {
    id: 'positive-psychology',
    name: 'The Garden',
    tagline: 'Tend what you wish to grow.',
    color: '#9fc16f',
    description: 'Wellbeing is not the absence of difficulty — it is what you are actively building. Positive emotion, engagement, relationships, meaning, and achievement: five conditions that make a life worth living.',
    coreVirtues: ['gratitude', 'strengths', 'resilience', 'connection'],
    resonantEmotions: ['joy', 'gratitude', 'hope', 'confidence', 'connection', 'sadness'],
    lessons: [
      {
        id: 'pospsych-three-good',
        title: 'Three good things',
        body: 'Writing three good things each day — and why they happened — trains the mind toward benefit-finding. Over time, this single practice has been shown to significantly reduce depression.',
        action: 'Write three good things from today and a one-sentence explanation for each.',
        practiceRoute: '/(branches)/journal/reflect',
      },
      {
        id: 'pospsych-strengths',
        title: 'Use your strengths',
        body: 'You are energized when using what you do naturally well. Using signature strengths in new ways produces lasting increases in wellbeing — not temporary boosts.',
        action: 'Name your top strength. Find one way to use it in the next twenty-four hours.',
        practiceRoute: '/(branches)/journal/reflect',
      },
      {
        id: 'pospsych-flow',
        title: 'Find your flow conditions',
        body: 'Peak experience occurs when challenge and skill are balanced — not too easy, not overwhelming. It requires clear goals, immediate feedback, and full absorption.',
        action: 'Design one task to be slightly more challenging than comfortable. Begin it now.',
        practiceRoute: '/(branches)/journey/quest',
      },
      {
        id: 'pospsych-gratitude-letter',
        title: 'Write a gratitude letter',
        body: 'Writing a detailed letter of thanks to someone who helped you — and reading it to them — is one of the most powerful wellbeing practices known. Three honest sentences is enough to begin.',
        action: 'Write three sentences of genuine thanks to someone specific.',
        practiceRoute: '/(branches)/journal/write',
      },
      {
        id: 'pospsych-perma',
        title: 'Tend your five conditions',
        body: 'Flourishing requires five conditions: positive emotion, engagement, relationships, meaning, and achievement. Check which is lowest right now — that is where the garden needs water.',
        action: 'Rate each condition from 1–5. Take one small action on the lowest.',
      },
    ],
  },

  // ── The Lantern (Logotherapy — meaning, response, purpose) ──
  {
    id: 'logotherapy',
    name: 'The Lantern',
    tagline: 'Find what gives this moment meaning.',
    color: '#b6a7ff',
    description: 'Those who survive the hardest circumstances often find meaning even within them. We cannot always choose what happens — but we can choose our response. In that space lives our freedom.',
    coreVirtues: ['meaning', 'responsibility', 'courage', 'love'],
    resonantEmotions: ['sadness', 'hope', 'anxiety', 'stress', 'connection'],
    lessons: [
      {
        id: 'logo-response',
        title: 'The space between',
        body: 'Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom. Find the space before your next reaction.',
        action: 'Find the space before your next reaction. Use it once today.',
      },
      {
        id: 'logo-meaning',
        title: 'Meaning in difficulty',
        body: 'When we can no longer change a situation, we are challenged to change ourselves. Suffering that has meaning can be borne; suffering without meaning cannot. What response would give this meaning?',
        action: 'Name one current difficulty. Ask: what response would give it meaning?',
        practiceRoute: '/(branches)/journal/reflect',
      },
      {
        id: 'logo-purpose-through-care',
        title: 'Purpose through care',
        body: 'You do not need to solve your whole life right now. Look around. Something near you can be cared for. Purpose begins in the immediate, the available, the small.',
        action: 'Improve one small thing in your immediate environment for two minutes.',
      },
      {
        id: 'logo-dereflection',
        title: 'Stop trying to be happy',
        body: 'Happiness cannot be pursued directly — it follows from meaning. When you turn your attention from your own state toward something or someone else, joy often arrives uninvited.',
        action: 'Do one thing for another person today without any expectation of return.',
      },
      {
        id: 'logo-legacy',
        title: 'What would I regret not doing?',
        body: 'The deeper question is not "what do I want?" but "what would I regret not having done?" The answer points toward genuine responsibility — toward the life that is actually yours to live.',
        action: 'Name one thing you would regret not doing. Take one step toward it today.',
        practiceRoute: '/(branches)/journal/write',
      },
    ],
  },

  // ── The Inner Sanctuary (Christian contemplative tradition — stillness, presence, mercy) ──
  {
    id: 'contemplative',
    name: 'The Inner Sanctuary',
    tagline: 'Rest in the stillness beneath the noise.',
    color: '#f5c451',
    description: 'Beneath all thought and feeling there is a still center that can be rested in. It does not have to be constructed or earned — only discovered. Stillness is not emptiness but the deepest kind of presence.',
    coreVirtues: ['surrender', 'presence', 'mercy', 'gratitude'],
    resonantEmotions: ['calm', 'sadness', 'gratitude', 'connection', 'hope', 'anxiety'],
    lessons: [
      {
        id: 'cont-still-center',
        title: 'The still center remains',
        body: 'A storm can move through awareness without becoming the whole of who you are. The inner still point is always available beneath the weather of thought and feeling — not distant, just beneath.',
        action: 'Sit for one minute and silently repeat: this is moving through me. It is not all of me.',
        practiceRoute: '/(branches)/practices/stillness',
      },
      {
        id: 'cont-mercy',
        title: 'Begin with mercy',
        body: 'The contemplative path begins not with achievement but with mercy — receiving it, and extending it. You cannot pour from an empty vessel. Begin with yourself.',
        action: 'Offer yourself one sentence of mercy, spoken aloud or within.',
      },
      {
        id: 'cont-gratitude-prayer',
        title: 'Gratitude as the ground',
        body: 'Gratitude is a prayer the body already knows how to say. It does not require a formal posture — only a moment of honest thanks for what quietly sustains you.',
        action: 'Name three small mercies from the last twenty-four hours.',
        practiceRoute: '/(branches)/journal/reflect',
      },
      {
        id: 'cont-surrender',
        title: 'Release the outcome',
        body: 'There is a quiet courage in consent — not forcing, not analyzing, but releasing. The tightest grip does not make the outcome more certain. It only exhausts the one gripping.',
        action: 'Name one outcome you have been gripping. Set it down for the next hour.',
      },
      {
        id: 'cont-presence',
        title: 'Consecrate the ordinary',
        body: 'Every small action — even washing dishes, even waiting — can become an act of devotion when done with full attention. Any moment can be consecrated. This one is available.',
        action: 'Do one ordinary task — slowly, on purpose, as an act of care.',
      },
    ],
  },

  // ── The Forge (Flow state / deep work — craft, focus, absorption) ──
  {
    id: 'flow',
    name: 'The Forge',
    tagline: 'Enter the work completely.',
    color: '#ff9d5c',
    description: 'There is a state of total absorption in a challenging activity where the sense of self dissolves into the work. This is not willpower — it is a condition that can be designed and entered.',
    coreVirtues: ['focus', 'craft', 'discipline', 'presence'],
    resonantEmotions: ['focus', 'energy', 'joy', 'confidence', 'stress'],
    lessons: [
      {
        id: 'flow-conditions',
        title: 'Design the conditions for deep work',
        body: 'Total absorption requires three things: a clear goal, immediate feedback, and a challenge matched to skill. None of these arrive automatically. The craftsperson designs for them before beginning.',
        action: 'Before your next work session, write: what is the goal? How will I know when I\'m done? Is this the right level of difficulty?',
      },
      {
        id: 'flow-single-task',
        title: 'One thing at a time',
        body: 'Switching between tasks does not save time — it costs it. There is a residue of attention left on the last task that takes time to clear. One thing, fully, produces more in less time.',
        action: 'Close everything except what you are doing now. Work for twenty minutes without switching.',
        practiceRoute: '/(branches)/journey/quest',
      },
      {
        id: 'flow-mushin',
        title: 'Enter action without commentary',
        body: 'Deep absorption begins when the mind stops narrating the action and enters it. You stop watching yourself work and become the work. The commentary is the thing that breaks the state.',
        action: 'Choose one simple task. Do it for five minutes without narrating yourself.',
      },
      {
        id: 'flow-rest',
        title: 'Protect deep recovery',
        body: 'The mind that never fully rests cannot fully focus. Rest is not wasted time — the unconscious continues to work on problems during recovery. Downtime is part of the discipline.',
        action: 'Schedule one thirty-minute block of complete rest today. No screens, no productivity.',
      },
      {
        id: 'flow-craft',
        title: 'Do the work for the work\'s sake',
        body: 'The craftsperson is not attached to outcome — only to the quality of this particular motion. Excellence is in the doing. The result is what happens after the doing; the practice is the doing itself.',
        action: 'Bring your full attention to the quality of one thing you are doing right now.',
      },
    ],
  },

  // ── The Offering (Purpose and service — contribution, stewardship, meaning) ──
  {
    id: 'purpose',
    name: 'The Offering',
    tagline: 'Live toward something larger.',
    color: '#ef786c',
    description: 'People who orient toward contribution — to others, to a cause, to craft — report deeper wellbeing than those oriented toward self. Purpose is not found waiting. It is built through action.',
    coreVirtues: ['service', 'integrity', 'stewardship', 'contribution'],
    resonantEmotions: ['hope', 'sadness', 'gratitude', 'energy', 'connection'],
    lessons: [
      {
        id: 'purpose-ikigai',
        title: 'Where gift and need meet',
        body: 'Purpose lives at the intersection of what you love, what you are good at, what the world needs, and what sustains you. You do not need all four in one activity — but the more you have, the more alive it feels.',
        action: 'Name one thing that touches at least two of these four. Do something small in that direction.',
      },
      {
        id: 'purpose-contribution',
        title: 'Make something better',
        body: 'Purpose does not require a grand mission. It requires a genuine orientation toward making something — a moment, a person, a project — better than you found it. Begin where you are.',
        action: 'Improve one small thing in your environment or someone\'s experience today.',
      },
      {
        id: 'purpose-stewardship',
        title: 'Care for what is in your keeping',
        body: 'Stewardship is the quiet form of purpose — caring well for what has been entrusted to you, whether a person, a body, a skill, or a responsibility. What in your keeping is asking for more care?',
        action: 'Name one thing in your care that deserves more attention. Give it five minutes.',
      },
      {
        id: 'purpose-legacy',
        title: 'Begin with the end in mind',
        body: 'Imagine your life as a story being written. What do you want the story to be about? Then consider your day in light of that. Live backward from the ending you want.',
        action: 'Write three sentences describing how you want to be remembered.',
        practiceRoute: '/(branches)/journal/write',
      },
      {
        id: 'purpose-next-step',
        title: 'The mission review',
        body: 'Purpose is made real one decision at a time. Your current commitments are a map of what you are actually living toward. Prune what does not serve it. Deepen what does.',
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
