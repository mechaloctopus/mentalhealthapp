// A guided CBT/DBT micro-session engine that runs fully on-device. It walks the
// user from venting → naming the thought → checking the distortion → reframing →
// one small action. It is structured (not a black-box chatbot) so it is reliably
// supportive. A real LLM (Claude via a secure backend) can be slotted in later
// behind the same turn interface — see docs/UPGRADE_PLAN.md (Phase 3).

export type CoachInput =
  | { kind: 'choice'; options: string[] }
  | { kind: 'text'; placeholder: string }
  | { kind: 'end' };

export interface CoachContext {
  emotionLabel: string;
  name: string;
  answers: Record<string, string>;
}

export interface CoachStep {
  id: string;
  message: (ctx: CoachContext) => string;
  input: (ctx: CoachContext) => CoachInput;
  save?: boolean; // include this answer in a journal save
}

const DISTORTIONS = ['Catastrophizing', 'All-or-nothing', 'Mind-reading', 'Self-blame', 'It just feels true'];

const REFRAMES: Record<string, string> = {
  Catastrophizing: 'When the mind jumps to the worst case, it rarely arrives. Most futures are more ordinary than our fear.',
  'All-or-nothing': 'Few things are all good or all bad. There is usually a livable middle you can stand on.',
  'Mind-reading': 'We can almost never know what others truly think — and we usually guess harsher than the truth.',
  'Self-blame': 'You are one part of a much bigger situation. Responsibility is rarely yours alone to carry.',
  'It just feels true': 'Feelings are real, but they are not always facts. A thought can feel true and still be only one view.',
};

export const REFLECT_FLOW: CoachStep[] = [
  {
    id: 'open',
    message: (c) => `You named that you're feeling ${c.emotionLabel.toLowerCase()}. I'm here with you. In your own words — what's weighing on you right now?`,
    input: () => ({ kind: 'text', placeholder: 'Say whatever is true…' }),
    save: true,
  },
  {
    id: 'thought',
    message: () => 'Thank you for saying it plainly. When you sit with that, what thought runs underneath it?',
    input: () => ({ kind: 'text', placeholder: 'The thought is…' }),
    save: true,
  },
  {
    id: 'distortion',
    message: () => 'Let’s look at that thought gently together. Which of these feels closest to how it’s shaped?',
    input: () => ({ kind: 'choice', options: DISTORTIONS }),
  },
  {
    id: 'reframe',
    message: (c) => `${REFRAMES[c.answers.distortion] ?? 'A thought can feel true and still be only one view.'}\n\nIf a dear friend said this exact thing to you, what would you gently tell them?`,
    input: () => ({ kind: 'text', placeholder: 'I would tell them…' }),
    save: true,
  },
  {
    id: 'evidence',
    message: () => 'That’s the kindness you deserve too. What’s one small piece of evidence that the worst version isn’t certain?',
    input: () => ({ kind: 'text', placeholder: 'One piece of evidence…' }),
    save: true,
  },
  {
    id: 'action',
    message: () => 'Good. Now let’s make it small and real — what is one tiny, doable thing you could do in the next hour?',
    input: () => ({ kind: 'text', placeholder: 'One small action…' }),
    save: true,
  },
  {
    id: 'close',
    message: (c) =>
      `That’s the work, ${c.name}. You moved from ${c.emotionLabel.toLowerCase()} toward a clear next step — without rushing or pretending. You can save this reflection to your journal, or simply carry it with you.`,
    input: () => ({ kind: 'end' }),
  },
];

export function buildJournalFromSession(ctx: CoachContext): string {
  const a = ctx.answers;
  const lines: string[] = [];
  if (a.open) lines.push(`What weighed on me: ${a.open}`);
  if (a.thought) lines.push(`The thought underneath: ${a.thought}`);
  if (a.distortion) lines.push(`Shape of the thought: ${a.distortion}`);
  if (a.reframe) lines.push(`What I'd tell a friend: ${a.reframe}`);
  if (a.evidence) lines.push(`Evidence it isn't certain: ${a.evidence}`);
  if (a.action) lines.push(`One small action: ${a.action}`);
  return lines.join('\n');
}
