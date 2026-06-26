// The Side Module's content. Everything is data so traditions become SMALL daily
// actions, quests, and reflections — never long lectures. Add a Path object and it
// appears in the app. All paths are presented as optional "wisdom paths": practices
// many have found meaningful, offered without asserting any tradition as definitive.
import type { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import type { TreeId } from './trees';

export type QuestKind = 'reflect' | 'action' | 'meditate' | 'breath' | 'learn' | 'service' | 'gratitude' | 'flow';

export interface QuestGrants {
  karma?: number;
  stewardship?: number;
  flow?: number;
}

export interface Quest {
  id: string;
  title: string;
  instruction: string;
  kind: QuestKind;
  trees: TreeId[];
  resonance: number;
  reflect?: string;
  minutes?: number;
  teaching?: string; // tiny lesson for 'learn' quests
  tradition?: string;
  repeatable?: boolean;
  grants?: QuestGrants;
}

export interface PathStage {
  id: string;
  title: string;
  theme: string;
  boss?: string;
  reward: string;
  quests: Quest[];
}

export interface Path {
  id: string;
  title: string;
  subtitle: string;
  tradition: string;
  blurb: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  stages: PathStage[];
}

// The six outcomes the whole module points toward. Progress is driven by Resonance.
export interface MissionStage {
  id: string;
  title: string;
  caption: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  threshold: number; // resonance to reach this stage
}

export const MISSION: MissionStage[] = [
  { id: 'stabilize', title: 'Stabilize the mind', caption: 'Steadiness before everything.', icon: 'water', color: colors.teal, threshold: 0 },
  { id: 'heal', title: 'Heal emotional suffering', caption: 'Meet what hurts with kindness.', icon: 'bandage', color: colors.coral, threshold: 300 },
  { id: 'habits', title: 'Build positive habits', caption: 'Small actions, repeated.', icon: 'repeat', color: colors.moss, threshold: 800 },
  { id: 'purpose', title: 'Discover purpose', caption: 'Purpose is practiced, not found.', icon: 'compass', color: colors.amber, threshold: 1600 },
  { id: 'wisdom', title: 'Develop wisdom', caption: 'See clearly; hold lightly.', icon: 'sparkles', color: colors.lavender, threshold: 2800 },
  { id: 'service', title: 'Live in service', caption: 'What you cultivate returns.', icon: 'hand-left', color: colors.blue, threshold: 4500 },
];

export function missionStageFor(resonance: number): { index: number; stage: MissionStage; next?: MissionStage } {
  let index = 0;
  for (let i = 0; i < MISSION.length; i++) if (resonance >= MISSION[i].threshold) index = i;
  return { index, stage: MISSION[index], next: MISSION[index + 1] };
}

/* ----------------------------- Universal daily pool ----------------------------- */
// Repeatable practices the daily generator can draw from.
export const DAILY_POOL: Quest[] = [
  { id: 'd-breath', title: 'Coherent breathing', instruction: 'Breathe in for 5, out for 5, for two minutes. Let heart, breath, and mind settle together.', kind: 'breath', trees: ['mindfulness'], resonance: 15, minutes: 2, tradition: 'Heart coherence', repeatable: true },
  { id: 'd-gratitude', title: 'Three good things', instruction: 'Name three small things that went right today, and why each happened.', kind: 'gratitude', trees: ['mindfulness', 'wisdom'], resonance: 12, reflect: 'Three good things…', tradition: 'Positive psychology', repeatable: true, grants: { karma: 1 } },
  { id: 'd-kindness', title: 'One quiet kindness', instruction: 'Do one small, unasked kindness for someone — a message, a thank-you, a hand.', kind: 'service', trees: ['compassion', 'relationships'], resonance: 18, tradition: 'The Golden Rule', repeatable: true, grants: { karma: 2, stewardship: 1 } },
  { id: 'd-sit', title: 'Watch the breath', instruction: 'Sit for three minutes. When the mind wanders, return gently. That return is the practice.', kind: 'meditate', trees: ['mindfulness'], resonance: 15, minutes: 3, tradition: 'Anapana', repeatable: true },
  { id: 'd-move', title: 'Move your body', instruction: 'Move for a few minutes — a walk, stretch, or a few sun salutations. Sharpen the saw.', kind: 'action', trees: ['fitness'], resonance: 12, tradition: '7 Habits · Sharpen the Saw', repeatable: true },
  { id: 'd-shadow', title: 'Name what you feel', instruction: 'Pause and label the feeling underneath: “This is anxiety / sadness / restlessness.” Naming loosens its grip.', kind: 'reflect', trees: ['mindfulness', 'wisdom'], resonance: 12, reflect: 'Right now I feel…', tradition: 'Emotional granularity', repeatable: true },
  { id: 'd-observer', title: 'Who is watching?', instruction: 'For one minute, watch your thoughts pass like clouds. Ask gently: who is aware of them?', kind: 'meditate', trees: ['wisdom', 'mindfulness'], resonance: 14, minutes: 1, tradition: 'Non-duality', repeatable: true },
  { id: 'd-learn', title: 'A line of wisdom', instruction: 'Read today’s short teaching slowly. Let one phrase stay with you through the day.', kind: 'learn', trees: ['wisdom'], resonance: 10, tradition: 'Wisdom traditions', repeatable: true },
  { id: 'd-inquiry', title: 'Self-inquiry', instruction: 'Ask quietly, “Who am I?” — not for an answer in words, but to feel the awareness the question points back to. Rest there for a minute.', kind: 'meditate', trees: ['wisdom'], resonance: 16, minutes: 1, reflect: 'What stayed when the thoughts quieted?', tradition: 'Ramana Maharshi · Atma Vichara', repeatable: true },
  { id: 'd-metta', title: 'Loving-kindness phrases', instruction: 'Silently offer: “May I be safe. May I be at ease.” Then send the same to someone you love, and to someone you find difficult.', kind: 'meditate', trees: ['compassion'], resonance: 16, minutes: 2, tradition: 'Metta (loving-kindness)', repeatable: true, grants: { karma: 1 } },
  { id: 'd-impermanence', title: 'Remember impermanence', instruction: 'Recall gently that this day, like all days, will pass. Let it make one ordinary thing more precious right now.', kind: 'reflect', trees: ['wisdom'], resonance: 14, reflect: 'What became precious?', tradition: 'Maraṇasati · memento mori', repeatable: true },
  { id: 'd-forgive', title: 'Set down one weight', instruction: 'Choose one small resentment — toward another or yourself — and, for today, set it down. You can pick it up tomorrow if you must.', kind: 'reflect', trees: ['compassion', 'wisdom'], resonance: 16, reflect: 'What did I release?', tradition: 'Forgiveness practice', repeatable: true, grants: { karma: 2 } },
];

/* ----------------------------------- Paths ----------------------------------- */

const temples: Path = {
  id: 'temples',
  title: 'The Five Temples',
  subtitle: 'Walk the inner gospel',
  tradition: 'Contemplative Christianity · Gospel of Mary',
  blurb: 'Five inner temples, each unlocking the next — from seeking truth to quiet union. A contemplative path, offered as practice, not doctrine.',
  color: colors.amber,
  icon: 'business',
  stages: [
    {
      id: 't-truth', title: 'Temple of Truth', theme: 'Seek truth over illusion.', boss: 'Ignorance', reward: 'Wisdom',
      quests: [
        { id: 't1-journal', title: 'An honest page', instruction: 'Write one page of unvarnished truth about your life right now — for your eyes only.', kind: 'reflect', trees: ['wisdom'], resonance: 25, reflect: 'The honest truth is…' },
        { id: 't1-question', title: 'Ask the hard question', instruction: 'Ask yourself one question you’ve been avoiding. Write what comes.', kind: 'reflect', trees: ['wisdom'], resonance: 25, reflect: 'The question I’ve avoided…' },
        { id: 't1-admit', title: 'Admit one mistake', instruction: 'Name one mistake honestly, without spin. Then offer yourself mercy.', kind: 'reflect', trees: ['wisdom', 'compassion'], resonance: 25, reflect: 'I was wrong about…' },
      ],
    },
    {
      id: 't-self', title: 'Temple of Self-Knowledge', theme: 'Know yourself.', boss: 'False Identity', reward: 'Insight',
      quests: [
        { id: 't2-shadow', title: 'Meet a shadow', instruction: 'Name a trait you dislike in others. Where does a smaller version live in you?', kind: 'reflect', trees: ['wisdom'], resonance: 28, reflect: 'My shadow shows up as…' },
        { id: 't2-voice', title: 'Voice journal', instruction: 'Do a voice check-in, then sit with what your tone revealed.', kind: 'reflect', trees: ['mindfulness'], resonance: 22 },
        { id: 't2-values', title: 'Name three values', instruction: 'Write the three values you most want to live by. Are your days pointing toward them?', kind: 'reflect', trees: ['purpose', 'wisdom'], resonance: 25, reflect: 'My three values…' },
      ],
    },
    {
      id: 't-lib', title: 'Temple of Liberation', theme: 'Move beyond attachment.', boss: 'Attachment', reward: 'Freedom',
      quests: [
        { id: 't3-detox', title: 'A small digital fast', instruction: 'Put the phone away for one hour. Notice the urge to reach for it, and let it pass.', kind: 'action', trees: ['mindfulness'], resonance: 25 },
        { id: 't3-forgive', title: 'Release one grievance', instruction: 'Choose one resentment you’re ready to set down. Write it, then let it go.', kind: 'reflect', trees: ['compassion'], resonance: 28, reflect: 'I release…', grants: { karma: 2 } },
        { id: 't3-nogossip', title: 'No gossip today', instruction: 'For one day, speak of no one in a way you wouldn’t in their presence.', kind: 'action', trees: ['relationships', 'wisdom'], resonance: 22, grants: { karma: 1 } },
      ],
    },
    {
      id: 't-mastery', title: 'Temple of Inner Mastery', theme: 'Emotions become allies.', boss: 'Fear · Anger · Pride · Envy', reward: 'Mastery',
      quests: [
        { id: 't4-patience', title: 'Practice patience', instruction: 'Choose one moment today to respond slowly instead of reacting. Breathe first.', kind: 'action', trees: ['mindfulness', 'leadership'], resonance: 25 },
        { id: 't4-courage', title: 'One brave act', instruction: 'Do one small thing that scares you a little. Courage is built in small reps.', kind: 'action', trees: ['leadership', 'purpose'], resonance: 28 },
        { id: 't4-opposite', title: 'Opposite action', instruction: 'When an unhelpful urge arises, do the gentle opposite once. Notice what shifts.', kind: 'action', trees: ['mindfulness'], resonance: 25, tradition: 'DBT' },
      ],
    },
    {
      id: 't-union', title: 'Temple of Union', theme: 'Everything becomes one.', reward: 'Inner light',
      quests: [
        { id: 't5-long', title: 'A longer sit', instruction: 'Meditate for ten unhurried minutes. No goal but to be here.', kind: 'meditate', trees: ['mindfulness', 'wisdom'], resonance: 35, minutes: 10 },
        { id: 't5-nature', title: 'Time in nature', instruction: 'Spend a few quiet minutes outside, simply present with what is alive around you.', kind: 'action', trees: ['mindfulness'], resonance: 25 },
        { id: 't5-service', title: 'Quiet service', instruction: 'Do one kind thing today expecting nothing in return.', kind: 'service', trees: ['compassion', 'service'], resonance: 30, grants: { karma: 3, stewardship: 2 } },
      ],
    },
  ],
};

const habits: Path = {
  id: 'habits',
  title: 'The Seven Habits',
  subtitle: 'One habit at a time',
  tradition: 'Covey · The 7 Habits',
  blurb: 'Train one foundational habit at a time. Each is a small monthly challenge, not a chapter to read.',
  color: colors.blue,
  icon: 'construct',
  stages: [
    { id: 'h1', title: 'Be Proactive', theme: 'Choose your response.', reward: 'Initiative', quests: [{ id: 'h1-q', title: 'One difficult choice', instruction: 'Choose one hard-but-right thing today and act before the excuse arrives.', kind: 'action', trees: ['leadership', 'purpose'], resonance: 25 }] },
    { id: 'h2', title: 'Begin With the End', theme: 'Know where you’re headed.', reward: 'Purpose', quests: [{ id: 'h2-q', title: 'Draft a life mission', instruction: 'Write one sentence describing the person you want to become.', kind: 'reflect', trees: ['purpose'], resonance: 25, reflect: 'My mission…' }] },
    { id: 'h3', title: 'First Things First', theme: 'Priorities over urgencies.', reward: 'Discipline', quests: [{ id: 'h3-q', title: 'The one big rock', instruction: 'Name the single most important task tomorrow and schedule it first.', kind: 'action', trees: ['leadership'], resonance: 22, reflect: 'Tomorrow’s big rock…' }] },
    { id: 'h4', title: 'Think Win-Win', theme: 'Abundance, not scarcity.', reward: 'Connection', quests: [{ id: 'h4-q', title: 'A win-win move', instruction: 'Find one situation today where you can help both yourself and someone else.', kind: 'service', trees: ['relationships'], resonance: 24, grants: { karma: 1 } }] },
    { id: 'h5', title: 'Seek First to Understand', theme: 'Listen deeply.', reward: 'Empathy', quests: [{ id: 'h5-q', title: 'Listen fully', instruction: 'Have one conversation where you listen to understand, not to reply.', kind: 'service', trees: ['relationships', 'compassion'], resonance: 24, grants: { karma: 1 } }] },
    { id: 'h6', title: 'Synergize', theme: 'The whole is greater.', reward: 'Unity', quests: [{ id: 'h6-q', title: 'Build something together', instruction: 'Invite one person to collaborate on something small today.', kind: 'service', trees: ['leadership', 'relationships'], resonance: 24 }] },
    { id: 'h7', title: 'Sharpen the Saw', theme: 'Renew yourself.', reward: 'Vitality', quests: [{ id: 'h7-q', title: 'Renew one dimension', instruction: 'Tend body, mind, heart, or spirit today — sleep, move, learn, or pray.', kind: 'action', trees: ['fitness', 'wisdom'], resonance: 22 }] },
  ],
};

const purpose: Path = {
  id: 'purpose',
  title: 'Acts of Stewardship',
  subtitle: 'Purpose is practiced',
  tradition: 'Service & purpose',
  blurb: 'Purpose isn’t discovered, it’s practiced. Look around and ask: how can I help? Tiny missions that quietly add up to a life of meaning.',
  color: colors.moss,
  icon: 'hand-right',
  stages: [
    {
      id: 'p-stew', title: 'Tiny Missions', theme: 'How can I help, right now?', reward: 'Stewardship',
      quests: [
        { id: 'p-trash', title: 'Pick up some trash', instruction: 'Pick up litter you didn’t drop. Leave one corner of the world better.', kind: 'service', trees: ['service'], resonance: 16, repeatable: true, grants: { stewardship: 2, karma: 1 } },
        { id: 'p-call', title: 'Call someone who’d smile', instruction: 'Call or message someone who’d be glad to hear from you.', kind: 'service', trees: ['relationships', 'service'], resonance: 18, repeatable: true, grants: { stewardship: 1, karma: 2 } },
        { id: 'p-teach', title: 'Teach something small', instruction: 'Share one useful thing you know with someone who could use it.', kind: 'service', trees: ['leadership', 'service'], resonance: 18, repeatable: true, grants: { stewardship: 2 } },
        { id: 'p-plant', title: 'Tend a living thing', instruction: 'Water a plant, feed a pet, or care for something alive.', kind: 'service', trees: ['service', 'mindfulness'], resonance: 14, repeatable: true, grants: { stewardship: 1 } },
        { id: 'p-cook', title: 'Make something nourishing', instruction: 'Cook or prepare something kind for your body or someone else’s.', kind: 'action', trees: ['nutrition', 'service'], resonance: 16, repeatable: true, grants: { stewardship: 1 } },
      ],
    },
  ],
};

const flow: Path = {
  id: 'flow',
  title: 'The Way of Mushin',
  subtitle: 'No-mind, pure action',
  tradition: 'Mushin · 無心',
  blurb: 'Stop trying — become the action. Short flow sessions for athletes, artists, coders, and anyone who wants to lose themselves in doing.',
  color: '#7db9ff',
  icon: 'flash',
  stages: [
    {
      id: 'f-flow', title: 'Flow Sessions', theme: 'Become the action.', reward: 'Flow',
      quests: [
        { id: 'f-deep', title: 'One deep-work block', instruction: 'Pick one task. Remove distractions. Work with full attention for 25 minutes — then stop.', kind: 'flow', trees: ['flow', 'creativity'], resonance: 22, minutes: 25, repeatable: true, grants: { flow: 3 } },
        { id: 'f-create', title: 'Make something, badly', instruction: 'Draw, write, or play for ten minutes with no judgement. Become the doing.', kind: 'flow', trees: ['creativity', 'flow'], resonance: 18, minutes: 10, repeatable: true, grants: { flow: 2 } },
        { id: 'f-single', title: 'Single-task one thing', instruction: 'Do one ordinary task — dishes, walking — with total presence, as meditation.', kind: 'flow', trees: ['mindfulness', 'flow'], resonance: 14, repeatable: true, grants: { flow: 1 } },
      ],
    },
  ],
};

const coherence: Path = {
  id: 'coherence',
  title: 'Heart Coherence',
  subtitle: 'Sync heart, breath, mind',
  tradition: 'Wisdom Codes · coherence',
  blurb: 'Turn wisdom into biofeedback. Instead of reading about it, you train it: slow breath, gratitude, and emotional regulation until heart and mind synchronize.',
  color: colors.coral,
  icon: 'heart-circle',
  stages: [
    {
      id: 'c-coh', title: 'Coherence Training', theme: 'Heart · breath · mind as one.', reward: 'Higher Resonance',
      quests: [
        { id: 'c-five', title: 'Five minutes of coherence', instruction: 'Breathe slowly (5 in, 5 out) while holding a feeling of gratitude in the chest, for five minutes.', kind: 'breath', trees: ['mindfulness', 'compassion'], resonance: 26, minutes: 5, repeatable: true },
        { id: 'c-visual', title: 'Coherent visualization', instruction: 'Breathe slowly and vividly picture one outcome you long for, with calm certainty.', kind: 'meditate', trees: ['mindfulness', 'purpose'], resonance: 20, minutes: 4, repeatable: true },
        { id: 'c-regulate', title: 'Reset a hard emotion', instruction: 'When a strong feeling rises, breathe it slower and softer for ten breaths. Notice the shift.', kind: 'breath', trees: ['mindfulness'], resonance: 18, repeatable: true },
      ],
    },
  ],
};

const wisdomLib: Path = {
  id: 'library',
  title: 'The Wisdom Library',
  subtitle: 'Five minutes, then practice',
  tradition: 'Wisdom traditions',
  blurb: 'Tiny lessons from many traditions — each a short teaching, a reflection, and one small exercise. Explore what resonates; nothing here is asserted as the only truth.',
  color: colors.lavender,
  icon: 'library',
  stages: [
    {
      id: 'l-east', title: 'Lessons in Letting Go', theme: 'Impermanence, non-attachment, presence.', reward: 'Equanimity',
      quests: [
        { id: 'l-upan', title: 'Upanishads · the witness', teaching: 'The ancient texts point to a quiet awareness behind every thought — the one who watches, untouched by the weather of the mind. You are not only the storm; you are also the sky it moves through.', instruction: 'Sit for two minutes and simply notice that you are aware. Rest as the witness.', kind: 'learn', trees: ['wisdom'], resonance: 18, minutes: 2, reflect: 'What did the witness notice?' },
        { id: 'l-diamond', title: 'Diamond Sutra · no fixed self', teaching: 'All conditioned things are like a dream, a flash of lightning, a passing cloud. Held too tightly, they wound us; held lightly, they set us free. Even “the self” is a river, not a stone.', instruction: 'Name one thing you’re gripping tightly. Loosen your hold by one finger today.', kind: 'learn', trees: ['wisdom'], resonance: 18, reflect: 'What I can hold more lightly…' },
        { id: 'l-lotus', title: 'Lotus Sutra · hidden light', teaching: 'The teaching of the lotus is that every being carries an unspoiled nature, like a jewel sewn into a coat and forgotten. Hope is not naïve; it is remembering what was always there.', instruction: 'Offer yourself one sentence of genuine hope today, and one to someone else.', kind: 'learn', trees: ['wisdom', 'compassion'], resonance: 18, grants: { karma: 1 } },
        { id: 'l-maha', title: 'Mahamudra · three keys', teaching: 'Mahamudra offers three simple keys for meditation: relax completely, remain open, and let thoughts pass without chasing or fighting them. Nothing to fix — only to allow.', instruction: 'Meditate for three minutes using the three keys: relax, stay open, let thoughts pass.', kind: 'meditate', trees: ['mindfulness', 'wisdom'], resonance: 20, minutes: 3 },
        { id: 'l-nondual', title: 'Non-duality · no separation', teaching: 'Much suffering comes from the felt line between “me” and “everything else.” For a moment, that line can soften — the hearer and the sound, the breather and the breath, revealed as one motion.', instruction: 'Listen to one sound fully until, briefly, there’s only hearing — no hearer.', kind: 'meditate', trees: ['wisdom', 'mindfulness'], resonance: 20, minutes: 2, reflect: 'What dissolved, even briefly?' },
      ],
    },
  ],
};

const bodhisattva: Path = {
  id: 'bodhisattva',
  title: 'The Bodhisattva Path',
  subtitle: 'For the benefit of all beings',
  tradition: 'Mahayana Buddhism · optional vow',
  blurb: 'Optional, never forced. Take a gentle vow to work for the benefit of all beings, then grow a Compassion level through small daily acts: Beginner → Helper → Guardian → Companion → Bodhisattva.',
  color: colors.coral,
  icon: 'infinite',
  stages: [
    {
      id: 'b-vow', title: 'The Vow', theme: 'May I be of benefit.', reward: 'Bodhicitta',
      quests: [
        { id: 'b-vow-take', title: 'Take the vow (gently)', instruction: 'Quietly set the intention: “Today, I will try to be of benefit to others.” That is the whole vow.', kind: 'reflect', trees: ['compassion'], resonance: 20, reflect: 'My intention today…', tradition: 'Bodhisattva vow' },
        { id: 'b-dedicate', title: 'Dedicate the merit', instruction: 'After any good thing you do today, silently dedicate its benefit to someone else, not yourself.', kind: 'reflect', trees: ['compassion'], resonance: 16, repeatable: true },
      ],
    },
    {
      id: 'b-tonglen', title: 'Tonglen · Sending and Taking', theme: 'Breathe in pain, breathe out relief.', boss: 'The instinct to turn away from suffering', reward: 'Open heart',
      quests: [
        { id: 'b-tonglen-q', title: 'Tonglen breath', instruction: 'Breathe in another’s pain; breathe out relief and warmth toward them, for two minutes.', kind: 'breath', trees: ['compassion', 'mindfulness'], resonance: 18, minutes: 2, repeatable: true, tradition: 'Tonglen' },
        { id: 'b-witness', title: 'Stay with discomfort', instruction: 'When you see someone suffering today, resist the urge to look away. Stay present for one extra breath before acting or moving on.', kind: 'meditate', trees: ['compassion', 'mindfulness'], resonance: 18, minutes: 1 },
      ],
    },
    {
      id: 'b-acts', title: 'The Acts', theme: 'Generosity, patience, and effort, practiced.', reward: 'Skillful means',
      quests: [
        { id: 'b-suffering', title: 'Ease one being’s burden', instruction: 'Notice one person (or creature) who is struggling, and do one small thing to ease it.', kind: 'service', trees: ['compassion', 'service'], resonance: 20, repeatable: true, grants: { karma: 2, stewardship: 1 } },
        { id: 'b-anon', title: 'A hidden kindness', instruction: 'Do one good thing today that no one will ever know you did.', kind: 'service', trees: ['compassion'], resonance: 22, repeatable: true, grants: { karma: 3 } },
        { id: 'b-difficult', title: 'Compassion for a difficult person', instruction: 'Bring to mind someone who frustrates you. Silently wish them freedom from whatever drives their behavior.', kind: 'meditate', trees: ['compassion'], resonance: 18, minutes: 2 },
      ],
    },
    {
      id: 'b-all', title: 'For All Beings', theme: 'Widen the circle until it has no edge.', reward: 'Bodhisattva',
      quests: [
        { id: 'b-widen', title: 'Widen the circle', instruction: 'Extend the same well-wishing you’d give a friend to a stranger, then to every being you can imagine, for two minutes.', kind: 'meditate', trees: ['compassion', 'wisdom'], resonance: 22, minutes: 2 },
        { id: 'b-vow-renew', title: 'Renew the vow', instruction: 'Look back at today and ask honestly: did I act for benefit? Renew the intention for tomorrow regardless of the answer.', kind: 'reflect', trees: ['compassion'], resonance: 18, reflect: 'Tomorrow, I will try to…' },
      ],
    },
  ],
};

const stoic: Path = {
  id: 'stoic',
  title: 'The Stoic Path',
  subtitle: 'Master what is yours',
  tradition: 'Stoicism · Aurelius, Epictetus, Seneca',
  blurb: 'Ancient practices for a steady mind: separate what you control from what you don’t, rehearse loss to deepen gratitude, and review each day with honesty and mercy.',
  color: colors.blue,
  icon: 'shield-half',
  stages: [
    {
      id: 's-control', title: 'The Dichotomy of Control', theme: 'Sort what is yours from what isn’t.', boss: 'Outrage at the uncontrollable', reward: 'Clarity',
      quests: [
        { id: 's-dichotomy', title: 'The dichotomy of control', instruction: 'Name one thing troubling you. Sort it: what here is in my control, and what is not? Release the rest.', kind: 'reflect', trees: ['wisdom'], resonance: 18, reflect: 'In my control… / Not in my control…', repeatable: true },
        { id: 's-judgment', title: 'It is not events, but judgments', instruction: 'Find one upsetting belief about a recent event, not the event itself. Could a calmer judgment fit the same facts?', kind: 'reflect', trees: ['wisdom'], resonance: 18, reflect: 'The judgment I can loosen…' },
      ],
    },
    {
      id: 's-perspective', title: 'Perspective Practices', theme: 'See your worry at its true size.', reward: 'Proportion',
      quests: [
        { id: 's-negative', title: 'Rehearse loss', instruction: 'Picture briefly losing something you love. Then return to it with fresh gratitude.', kind: 'reflect', trees: ['wisdom', 'mindfulness'], resonance: 16, repeatable: true, tradition: 'Negative visualization' },
        { id: 's-aboveview', title: 'The view from above', instruction: 'Imagine your life seen from far above — the city, the earth, the stars. Let today’s worry find its size.', kind: 'meditate', trees: ['wisdom'], resonance: 16, minutes: 3, repeatable: true },
        { id: 's-obstacle', title: 'The obstacle is the way', instruction: 'Name one obstacle in front of you right now. Write one way it could be the very material your character needs.', kind: 'reflect', trees: ['wisdom', 'leadership'], resonance: 18, reflect: 'The obstacle, used well…' },
      ],
    },
    {
      id: 's-virtue', title: 'Virtue in Action', theme: 'Wisdom, justice, courage, temperance — lived, not just admired.', boss: 'Excuse-making', reward: 'Character',
      quests: [
        { id: 's-roleplay', title: 'Act your best role today', instruction: 'Pick one Stoic virtue — courage, justice, temperance, or wisdom — and find one concrete chance to practice it before the day ends.', kind: 'action', trees: ['leadership', 'wisdom'], resonance: 22 },
        { id: 's-discomfort', title: 'Voluntary discomfort', instruction: 'Choose one small, safe discomfort on purpose — a cold shower, an unwanted task done first. Notice how little it costs once chosen.', kind: 'action', trees: ['fitness', 'wisdom'], resonance: 20 },
      ],
    },
    {
      id: 's-review', title: 'The Evening Review', theme: 'A daily reckoning, honest and kind.', reward: 'Equanimity',
      quests: [
        { id: 's-evening', title: 'Evening review', instruction: 'Review your day honestly and kindly: what did I do well, what could be better, what can I let go?', kind: 'reflect', trees: ['wisdom', 'leadership'], resonance: 18, reflect: 'Well / Better / Let go…', repeatable: true },
        { id: 's-amorfati', title: 'Amor fati', instruction: 'Find one thing about today, even a hard thing, that you can choose to accept fully.', kind: 'reflect', trees: ['wisdom'], resonance: 18, repeatable: true },
        { id: 's-mortality', title: 'Memento mori, lightly held', instruction: 'Recall that your time is finite — not to fear it, but to spend today a little more deliberately because of it.', kind: 'reflect', trees: ['wisdom'], resonance: 18, reflect: 'Spent more deliberately because…' },
      ],
    },
  ],
};

export const PATHS: Path[] = [temples, habits, purpose, flow, coherence, bodhisattva, stoic, wisdomLib];
export const PATH_BY_ID: Record<string, Path> = Object.fromEntries(PATHS.map((p) => [p.id, p]));

// Flat index of every quest (path quests + daily pool).
const allQuests: Record<string, Quest> = {};
for (const q of DAILY_POOL) allQuests[q.id] = q;
for (const p of PATHS) for (const s of p.stages) for (const q of s.quests) allQuests[q.id] = q;

export function getQuest(id: string): Quest | undefined {
  return allQuests[id];
}
export function getPath(id: string): Path | undefined {
  return PATH_BY_ID[id];
}
export function pathOfQuest(id: string): Path | undefined {
  for (const p of PATHS) for (const s of p.stages) if (s.quests.some((q) => q.id === id)) return p;
  return undefined;
}
export function totalPathQuests(p: Path): number {
  return p.stages.reduce((a, s) => a + s.quests.length, 0);
}
