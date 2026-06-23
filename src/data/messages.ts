// 365 daily messages — thoughtful affirmations, devotionals, quotes, breath cues,
// grounding, gratitude, stillness, resilience, and reflective thoughts.
// Built deterministically so every day of the year maps to a stable, varied message.

import { colors } from '../theme/theme';

export type MessageType =
  | 'affirmation'
  | 'devotional'
  | 'quote'
  | 'breath'
  | 'grounding'
  | 'gratitude'
  | 'stillness'
  | 'resilience'
  | 'thought';

export interface DailyMessage {
  id: number; // 1..365 — day of year
  type: MessageType;
  title: string;
  body: string;
  action: string;
  author?: string;
  accent: string;
}

export const TYPE_META: Record<
  MessageType,
  { label: string; accent: string; verb: string }
> = {
  affirmation: { label: 'Affirmation', accent: colors.teal, verb: 'Practice' },
  devotional: { label: 'Devotional', accent: colors.amber, verb: 'Reflect' },
  quote: { label: 'Quote', accent: colors.lavender, verb: 'Sit with' },
  breath: { label: 'Breath cue', accent: colors.blue, verb: 'Try' },
  grounding: { label: 'Grounding', accent: colors.moss, verb: 'Notice' },
  gratitude: { label: 'Gratitude', accent: colors.amber, verb: 'Write' },
  stillness: { label: 'Stillness', accent: colors.teal, verb: 'Scan' },
  resilience: { label: 'Resilience', accent: colors.coral, verb: 'Choose' },
  thought: { label: 'Thought', accent: colors.lavender, verb: 'Consider' },
};

type Seed = { title: string; body: string; action: string; author?: string };

const AFFIRMATIONS: Seed[] = [
  { title: 'Win the next minute', body: 'I can return to peace without rushing the process.', action: 'Take three slow breaths before the next thing you do.' },
  { title: 'Clean beginning', body: 'My breath gives me a clean place to begin.', action: 'Place a hand on your chest and begin again, gently.' },
  { title: 'Honest and gentle', body: 'I can be honest and gentle at the same time.', action: 'Say one true thing to yourself with kindness.' },
  { title: 'Release the finished', body: 'I release what is finished and meet what is here.', action: 'Name one thing you are ready to set down.' },
  { title: 'One clear action', body: 'I choose one clear action over a hundred anxious thoughts.', action: 'Pick the smallest next step and do only that.' },
  { title: 'Available peace', body: 'Stillness is available in the next breath.', action: 'Pause and let your shoulders drop a half inch.' },
  { title: 'Bless the imperfect', body: 'I can bless my life without needing it to be perfect.', action: 'Find one ordinary thing and silently thank it.' },
  { title: 'Ready to release', body: 'I forgive what I am ready to release.', action: 'Unclench your jaw and let one grievance soften.' },
  { title: 'Weather, not identity', body: 'My mood is weather. My awareness is the sky.', action: 'Watch one feeling move through without naming it good or bad.' },
  { title: 'Enough for now', body: 'What I have done today is enough for today.', action: 'List nothing. Just exhale and accept the day as it is.' },
  { title: 'Steady hands', body: 'I can hold difficulty with steady hands.', action: 'Loosen your grip, then take one deliberate breath.' },
  { title: 'Worthy of rest', body: 'I am allowed to rest before I have earned it.', action: 'Sit down for sixty seconds and do absolutely nothing.' },
  { title: 'Smaller and truer', body: 'I can make this smaller and truer.', action: 'Cut your to-do list to a single honest item.' },
  { title: 'Room to feel', body: 'There is room in me for this feeling to pass.', action: 'Let the feeling be here for one full breath, then continue.' },
  { title: 'Soft strength', body: 'My softness is a kind of strength.', action: 'Relax your face and meet the moment without armor.' },
  { title: 'Return, again', body: 'I can wander and still find my way back.', action: 'Notice where your mind went, and return to your breath.' },
  { title: 'Slow is allowed', body: 'I am allowed to move at the speed of my breath.', action: 'Do the next task one notch slower than usual.' },
  { title: 'Kind to the body', body: 'I can treat my body like someone I love.', action: 'Drink a glass of water slowly and on purpose.' },
  { title: 'Less proving', body: 'I have nothing to prove in this quiet moment.', action: 'Let your hands rest open in your lap for a breath.' },
  { title: 'Trust the return', body: 'Calm is a place I keep learning to come back to.', action: 'Picture one calm place and breathe there for a moment.' },
  { title: 'Permission to begin', body: 'I am allowed to begin again without making a speech.', action: 'Choose the next clean action and take it quietly.' },
  { title: 'Gentle pace', body: 'I do not have to hurry my own healing.', action: 'Place both feet flat and feel the floor for five seconds.' },
  { title: 'Small and real', body: 'Small and real beats big and imaginary.', action: 'Do one tiny thing you have been avoiding.' },
  { title: 'Light grip', body: 'I can care deeply and hold things lightly.', action: 'Open your hands and exhale fully, twice.' },
  { title: 'Present company', body: 'I can be good company to myself right now.', action: 'Speak to yourself the way a kind friend would.' },
];

const DEVOTIONALS: Seed[] = [
  { title: 'A single honest breath', body: 'Grace can begin as a single honest breath.', action: 'Breathe in slowly and let the exhale be a small prayer.' },
  { title: 'Proof of arriving', body: 'Your breath is proof that life is still arriving.', action: 'Touch your upper lip and feel five breaths come and go.' },
  { title: 'Mercy first', body: 'Begin with mercy, especially toward yourself.', action: 'Offer yourself one sentence of mercy, out loud or within.' },
  { title: 'Quiet faith', body: 'Faith can be as quiet as choosing to continue.', action: 'Take the next ordinary step as an act of trust.' },
  { title: 'Held in stillness', body: 'In stillness, you are already held.', action: 'Sit and let yourself be carried by the quiet for a minute.' },
  { title: 'Light enough', body: 'You do not need all the light, only enough for the next step.', action: 'Name the one next step you can see, and trust it.' },
  { title: 'Gratitude as prayer', body: 'Gratitude is a prayer the body already knows.', action: 'Name three small mercies from the last day.' },
  { title: 'Surrender the grip', body: 'Some things are healed only when we stop gripping them.', action: 'Name one thing you can release into something larger.' },
  { title: 'Be still and know', body: 'Be still, and let the knowing come to you.', action: 'Close your eyes and listen inward for ten seconds.' },
  { title: 'Daily bread', body: 'Today has exactly the strength today requires.', action: 'Ask only for what this day needs, and let tomorrow wait.' },
  { title: 'A wider love', body: 'You are loved beyond your usefulness.', action: 'Receive that truth for one slow breath before moving on.' },
  { title: 'The narrow gate', body: 'The way through is often smaller than the way around.', action: 'Choose the honest path even if it is the harder one.' },
  { title: 'Forgiven and free', body: 'What is forgiven no longer needs to be carried.', action: 'Set down one thing you have already been forgiven for.' },
  { title: 'Lamp for the feet', body: 'You are given light for your feet, not the whole road.', action: 'Trust the small patch of clarity you have right now.' },
  { title: 'Rest for the weary', body: 'There is a rest that is not the same as quitting.', action: 'Let your striving pause without calling it failure.' },
];

const QUOTES: Seed[] = [
  { title: 'Know thyself', body: 'Know thyself.', action: 'Notice one true thing about how you feel right now.', author: 'Delphic maxim' },
  { title: 'This too', body: 'This too shall pass.', action: 'Let the hard moment be temporary in your mind.', author: 'Traditional proverb' },
  { title: 'The only way', body: 'The only way out is through.', action: 'Take the next step into the thing, not around it.', author: 'Robert Frost' },
  { title: 'We become', body: 'What we think, we become.', action: 'Choose one thought worth becoming.', author: 'Traditional saying' },
  { title: 'Be the calm', body: 'Within you there is a stillness to which you can retreat at any time.', action: 'Retreat there now for three breaths.', author: 'Hermann Hesse' },
  { title: 'Between stimulus', body: 'Between stimulus and response there is a space.', action: 'Find the space before your next reaction.', author: 'Viktor Frankl' },
  { title: 'One step', body: 'It does not matter how slowly you go as long as you do not stop.', action: 'Take one small step, however slow.', author: 'Confucius' },
  { title: 'The wound', body: 'The wound is the place where the light enters you.', action: 'Let one tender place be a doorway, not a verdict.', author: 'Rumi' },
  { title: 'Begin again', body: 'In the midst of winter, I found there was within me an invincible summer.', action: 'Find one warm thing inside the cold of today.', author: 'Albert Camus' },
  { title: 'Watch the breath', body: 'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.', action: 'Anchor to one full breath.', author: 'Thich Nhat Hanh' },
  { title: 'Quiet mind', body: 'The quieter you become, the more you are able to hear.', action: 'Lower the volume of your thoughts for ten seconds.', author: 'Ram Dass' },
  { title: 'No mud, no lotus', body: 'No mud, no lotus.', action: 'Let today’s difficulty be the soil for something.', author: 'Thich Nhat Hanh' },
  { title: 'Present moment', body: 'The present moment is the only place where life can be found.', action: 'Arrive fully in this one moment.', author: 'Thich Nhat Hanh' },
  { title: 'Fall and rise', body: 'Our greatest glory is not in never falling, but in rising every time we fall.', action: 'Rise gently from one small fall today.', author: 'Confucius' },
  { title: 'Tend the garden', body: 'We must cultivate our garden.', action: 'Tend one small thing within your reach.', author: 'Voltaire' },
  { title: 'Be water', body: 'Be like water making its way through cracks.', action: 'Flow around one obstacle instead of forcing it.', author: 'Bruce Lee' },
  { title: 'Enough', body: 'Enough is a feast.', action: 'Let what you have right now be enough for now.', author: 'Buddhist proverb' },
  { title: 'Begin where you are', body: 'Start where you are. Use what you have. Do what you can.', action: 'Name what you have, then use it.', author: 'Arthur Ashe' },
  { title: 'The obstacle', body: 'The obstacle is the way.', action: 'Treat one obstacle as the path itself.', author: 'Marcus Aurelius' },
  { title: 'Choose your thoughts', body: 'You have power over your mind, not outside events.', action: 'Reclaim one thought you can actually control.', author: 'Marcus Aurelius' },
];

const BREATH: Seed[] = [
  { title: 'Upper lip', body: 'Your breath is proof life is still arriving.', action: 'Rest attention on your upper lip for five slow breaths.' },
  { title: 'Long exhale', body: 'A longer exhale tells your body it is safe.', action: 'Breathe in for four, out for six, six times.' },
  { title: 'Box of calm', body: 'Calm has a simple shape you can trace with breath.', action: 'In four, hold four, out four, hold four — four rounds.' },
  { title: 'Sighs of relief', body: 'A double inhale and slow sigh resets the system.', action: 'Two quick inhales through the nose, long sigh out.' },
  { title: 'Breath as anchor', body: 'When thoughts pull, the breath holds.', action: 'Count ten breaths; start over if you lose count.' },
  { title: 'Belly soft', body: 'The breath teaches the belly to soften.', action: 'Breathe into your belly so it gently rises, ten times.' },
  { title: 'Cooling breath', body: 'You can change your state with a single breath.', action: 'Inhale through the nose, exhale slowly through pursed lips.' },
  { title: 'Three-part breath', body: 'Fill low, then mid, then high — and release.', action: 'Breathe into belly, ribs, chest; exhale top to bottom.' },
  { title: 'Pause at the top', body: 'There is a quiet at the top of the inhale.', action: 'Inhale fully, pause two seconds, release slowly.' },
  { title: 'Even keel', body: 'Even breathing makes an even mind.', action: 'Match inhale and exhale to a count of five, five times.' },
];

const GROUNDING: Seed[] = [
  { title: 'Five senses', body: 'Your senses are a doorway back to now.', action: 'Name 5 things you see, 4 you hear, 3 you can touch.' },
  { title: 'Feet on earth', body: 'The ground is holding you completely.', action: 'Press both feet down and feel the floor for ten seconds.' },
  { title: 'Name it', body: 'Naming a feeling loosens its grip.', action: 'Say silently: “This is anxiety,” or whatever is true.' },
  { title: 'Cold water', body: 'A small shock returns you to the body.', action: 'Run cool water over your wrists for thirty seconds.' },
  { title: 'Sound map', body: 'There is always sound to come back to.', action: 'Find the furthest sound, then the closest one.' },
  { title: 'Hands first', body: 'The hands are an easy place to begin again.', action: 'Press your fingertips together and notice the pressure.' },
  { title: 'Three colors', body: 'Attention can be aimed like a soft light.', action: 'Find three things of the same color around you.' },
  { title: 'Weight of you', body: 'Let gravity do some of the holding.', action: 'Notice the weight of your body on the chair or floor.' },
  { title: 'One object', body: 'A single object can quiet a loud mind.', action: 'Study one nearby object as if you had never seen it.' },
  { title: 'Temperature', body: 'The body is always reporting the present.', action: 'Notice where you feel warm and where you feel cool.' },
];

const GRATITUDE: Seed[] = [
  { title: 'What stayed', body: 'Find one small thing that stayed.', action: 'Write down one thing that did not go wrong today.' },
  { title: 'Three good', body: 'Naming the good trains the eye to find it.', action: 'Write three good things and why each happened.' },
  { title: 'A person', body: 'Someone made today lighter, even slightly.', action: 'Name one person you are quietly grateful for.' },
  { title: 'The ordinary', body: 'Ordinary things are quietly holding you up.', action: 'Thank one ordinary comfort: warmth, water, a chair.' },
  { title: 'Your body', body: 'Your body did a great deal today, unasked.', action: 'Thank one part of your body that served you well.' },
  { title: 'A past self', body: 'A past version of you set something up for now.', action: 'Thank a past you for one helpful choice.' },
  { title: 'Small mercy', body: 'Mercies are usually small and easy to miss.', action: 'Recall one small mercy from the last few hours.' },
  { title: 'Still here', body: 'You are still here, and that is not nothing.', action: 'Write thanks for simply having arrived at today.' },
  { title: 'A sense', body: 'One sense gave you something good today.', action: 'Name a taste, sound, or sight you enjoyed.' },
  { title: 'Enough today', body: 'Today held enough, even if it did not hold everything.', action: 'Write one way today was enough.' },
];

const STILLNESS: Seed[] = [
  { title: 'Forehead to heart', body: 'Peace is trained one quiet return at a time.', action: 'Scan slowly from forehead down to your heart.' },
  { title: 'Soften the face', body: 'The face holds tension we forget we are holding.', action: 'Relax forehead, eyes, jaw, and tongue in turn.' },
  { title: 'Let it pass', body: 'Let pleasant sensations pass. Let unpleasant pass.', action: 'Observe one sensation without following its story.' },
  { title: 'Top to toe', body: 'Awareness can move like warm light through the body.', action: 'Sweep attention from the crown to the toes once.' },
  { title: 'Shoulders down', body: 'Stillness often begins below the shoulders.', action: 'Drop your shoulders and let your arms grow heavy.' },
  { title: 'The still point', body: 'There is a quiet center that is always here.', action: 'Rest attention behind the breastbone for a minute.' },
  { title: 'Hands and breath', body: 'Stillness is observation before story.', action: 'Watch your hands rise and fall with the breath.' },
  { title: 'Whole body', body: 'The whole body can be felt at once, softly.', action: 'Sense the entire body as one field for ten breaths.' },
  { title: 'Behind the eyes', body: 'Let the seeing soften without closing.', action: 'Relax the muscles behind your eyes for a moment.' },
  { title: 'Quiet return', body: 'Each return to stillness is a small victory.', action: 'When the mind moves, return without complaint.' },
];

const RESILIENCE: Seed[] = [
  { title: 'Begin again', body: 'You are allowed to begin again without making a speech.', action: 'Choose the next clean action and take it.' },
  { title: 'Act on truth', body: 'Do one honest thing before asking yourself to feel different.', action: 'Find one truth you can act on right now.' },
  { title: 'Lower the bar', body: 'A lower bar you can clear beats a high one you can’t.', action: 'Shrink the task until it is obviously doable.' },
  { title: 'Next right thing', body: 'You only need the next right thing, not the whole plan.', action: 'Name the next right thing and do just that.' },
  { title: 'Through the door', body: 'Half the battle is walking through the door.', action: 'Do the first five seconds of the hard thing.' },
  { title: 'Carry less', body: 'You can put some of it down and still keep going.', action: 'Name one burden you can set aside for today.' },
  { title: 'Steady, not fast', body: 'Steady wins more often than fast.', action: 'Choose a pace you can keep for the whole day.' },
  { title: 'After the fall', body: 'Falling is part of it; staying down is optional.', action: 'Rise from one small setback without a verdict.' },
  { title: 'One percent', body: 'A one percent better day still counts.', action: 'Do one thing slightly better than yesterday.' },
  { title: 'Ask for help', body: 'Reaching out is a strength, not a failure.', action: 'Send one honest message to someone you trust.' },
  { title: 'Protect the basics', body: 'Sleep, water, light, and movement carry the rest.', action: 'Tend one basic need in the next hour.' },
  { title: 'Future you', body: 'Do one small favor for the person you will be tonight.', action: 'Set up one thing to make later easier.' },
];

const THOUGHTS: Seed[] = [
  { title: 'Weather and sky', body: 'Your mood is weather. Your awareness is sky.', action: 'Watch the weather without becoming it.' },
  { title: 'Thoughts aren’t facts', body: 'A thought is an offer, not a verdict.', action: 'Question one thought instead of obeying it.' },
  { title: 'Name the story', body: 'The mind narrates; you do not have to believe it.', action: 'Label the current story: “I’m telling myself that…”' },
  { title: 'And not but', body: 'Two true things can sit side by side.', action: 'Say: “This is hard, AND I can do the next part.”' },
  { title: 'Whose voice', body: 'Not every inner voice is your own.', action: 'Ask whether a harsh thought is even yours.' },
  { title: 'Zoom out', body: 'Most things look smaller from a week away.', action: 'Ask if this will matter in a month.' },
  { title: 'Evidence check', body: 'Anxious thoughts rarely survive a fair trial.', action: 'List one piece of evidence against the worry.' },
  { title: 'Both/and', body: 'You can be struggling and still be okay.', action: 'Hold the struggle and the okay-ness together.' },
  { title: 'Soften the should', body: 'Shoulds are heavier than they look.', action: 'Swap one “should” for “I could, if I choose.”' },
  { title: 'Compassion swap', body: 'Talk to yourself as you would to a friend in this spot.', action: 'Rephrase one harsh thought with kindness.' },
  { title: 'The next minute', body: 'You only have to manage the next minute.', action: 'Plan only the very next minute.' },
  { title: 'Let the wave', body: 'Feelings rise, peak, and fall on their own.', action: 'Ride one feeling for ninety seconds without fixing it.' },
];

// Weekly rhythm of types — a calm, varied cadence repeated across the year.
const RHYTHM: MessageType[] = [
  'affirmation',
  'breath',
  'quote',
  'gratitude',
  'grounding',
  'devotional',
  'affirmation',
  'stillness',
  'thought',
  'resilience',
  'quote',
  'affirmation',
  'breath',
  'devotional',
];

const POOLS: Record<MessageType, Seed[]> = {
  affirmation: AFFIRMATIONS,
  devotional: DEVOTIONALS,
  quote: QUOTES,
  breath: BREATH,
  grounding: GROUNDING,
  gratitude: GRATITUDE,
  stillness: STILLNESS,
  resilience: RESILIENCE,
  thought: THOUGHTS,
};

function buildYear(): DailyMessage[] {
  const out: DailyMessage[] = [];
  const cursor: Record<MessageType, number> = {
    affirmation: 0, devotional: 0, quote: 0, breath: 0, grounding: 0,
    gratitude: 0, stillness: 0, resilience: 0, thought: 0,
  };
  for (let day = 1; day <= 365; day++) {
    const type = RHYTHM[(day - 1) % RHYTHM.length];
    const pool = POOLS[type];
    const seed = pool[cursor[type] % pool.length];
    cursor[type]++;
    out.push({
      id: day,
      type,
      title: seed.title,
      body: seed.body,
      action: seed.action,
      author: seed.author,
      accent: TYPE_META[type].accent,
    });
  }
  return out;
}

export const MESSAGES: DailyMessage[] = buildYear();

export function dayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const day = Math.floor(diff / 86400000);
  return Math.min(365, Math.max(1, day));
}

export function messageForDay(day: number): DailyMessage {
  const idx = ((day - 1) % 365 + 365) % 365;
  return MESSAGES[idx];
}

export function todaysMessage(date = new Date()): DailyMessage {
  return messageForDay(dayOfYear(date));
}

export function getMessageById(id: number): DailyMessage | undefined {
  return MESSAGES.find((m) => m.id === id);
}
