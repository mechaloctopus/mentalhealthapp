// The mystery-school context layer: for each wisdom path, the *concept* behind it,
// its *source material* (honestly attributed), how we translate it into practice, and
// deeper per-stage teachings. Kept separate from the quest data so the curriculum can
// grow without touching mechanics. All material is offered as optional contemplative
// practice — "explore what resonates" — never as religious instruction or dogma.

export interface PathContext {
  /** What the idea actually is — the concept, in plain language. */
  concept: string;
  /** Where it comes from — texts, figures, dates, honestly cited. */
  source: string;
  /** How we turn the teaching into small daily practice. */
  practice: string;
  /** Optional deeper teaching for individual stages, keyed by stage id. */
  teachings?: Record<string, string>;
}

export const PATH_CONTEXT: Record<string, PathContext> = {
  temples: {
    concept:
      'The Gospel of Mary preserves an early contemplative Christianity centered on inner transformation rather than rules. Its Savior teaches that matter is impermanent and dissolves back to its root; that "there is no sin" inherent in us — suffering arises when natures are mixed and the soul forgets itself; and that the Good comes "to restore every nature to its root." Mary then recounts a vision of the soul rising home, answering the Powers (Authorities) that try to hold it back. The Five Temples walk that ascent: Truth, Self-Knowledge, Liberation, Inner Mastery, and Union.',
    source:
      'The Gospel of Mary (Mary of Magdala) survives in a 5th-century Coptic manuscript, the Berlin Codex (Papyrus Berolinensis 8502), with two earlier Greek fragments (Papyrus Rylands 463 and Oxyrhynchus 3525); the text is usually dated to the 2nd century. About half is lost. Translations and scholarship: Karen L. King, "The Gospel of Mary of Magdala" (2003).',
    practice:
      'Rather than reading the gospel, you walk it: short daily acts of honesty, self-inquiry, release, emotional mastery, and stillness — each temple a stage of the soul’s homeward ascent.',
    teachings: {
      't-truth':
        '"Do not lay down any rules beyond what I appointed for you, and do not give a law like the lawgiver, lest you be constrained by it." Truth begins by seeing what is, without the comfort of borrowed certainties.',
      't-self':
        'The Savior teaches that the Good comes "to restore every nature to its root." To know yourself is to find that root beneath the borrowed masks — what the text calls the true Human within.',
      't-lib':
        'In Mary’s vision the soul rises past the Power of Desire (Craving), which says, "I did not see you descend, yet now I see you ascend." The soul answers that it was seen and passed by, no longer bound. Liberation is loosening attachment’s grip.',
      't-mastery':
        'The fourth Power, Wrath, takes seven forms — darkness, craving, ignorance, zeal for death, the kingdom of the flesh, the foolish wisdom of the flesh, the wrathful wisdom. The soul answers each and is set free: "What binds me has been slain… from this hour I attain to rest." Mastery is meeting each inner force without being ruled by it.',
      't-union':
        '"From now on I will attain to the rest of the time, of the season, of the age, in silence." Union is the soul’s rest in its root — and, in the gospel, Mary then encourages the grieving disciples to "praise his greatness, for he has prepared us and made us into true Human beings."',
    },
  },
  habits: {
    concept:
      'A "character ethic": lasting effectiveness comes from inner principles practiced into habits, not from personality tricks. The seven habits move from dependence (self-mastery) to interdependence (working with others) to renewal.',
    source:
      'Stephen R. Covey, "The 7 Habits of Highly Effective People" (1989), drawing on his survey of two centuries of success literature.',
    practice:
      'Train one foundational habit at a time as a small monthly challenge — a single proactive choice, a clarified mission, one big rock — rather than reading the book.',
  },
  purpose: {
    concept:
      'Meaning is not primarily discovered by introspection but created through responsibility and contribution. When we stop asking "what is my purpose?" and start asking "how can I help, here, now?", purpose appears in the doing.',
    source:
      'Viktor Frankl, "Man’s Search for Meaning" (1946) and logotherapy; the behavioral-activation tradition in modern psychology; and service ethics common to many wisdom traditions.',
    practice:
      'Tiny stewardship missions — pick up litter, call someone, tend a living thing — that accumulate into a felt sense of meaning and earn Stewardship.',
  },
  flow: {
    concept:
      'Mushin ("no-mind") is the state in which action arises without the interference of self-conscious thought — the archer who stops aiming and lets the arrow loose itself. Modern psychology calls its cousin "flow": complete, effortless absorption in a task.',
    source:
      'Zen and the martial arts (budō); Takuan Sōhō, "The Unfettered Mind" (17th c.); Eugen Herrigel, "Zen in the Art of Archery" (1948); and Mihály Csíkszentmihályi, "Flow" (1990).',
    practice:
      'Short, single-tasked sessions of deep work or creation with distractions removed — you stop trying and become the doing, earning Flow.',
  },
  coherence: {
    concept:
      'When breath, heart rhythm, and emotion settle into a smooth, ordered pattern, the body enters "coherence" — measurable as a smooth heart-rate-variability wave. Slow breathing and a felt sense of gratitude or care are the most reliable doorways in.',
    source:
      'Heart-rate-variability and resonance-breathing research (e.g., the HeartMath Institute; Lehrer & Gevirtz on resonance-frequency breathing), popularized in Gregg Braden’s work. Presented here as wellness practice, not medical treatment.',
    practice:
      'Five minutes of paced breathing (about five seconds in, five out) while holding a warm feeling in the chest — turning a concept into a trainable skill.',
  },
  bodhisattva: {
    concept:
      'The bodhisattva is one who vows to seek awakening not for themselves alone but for the benefit of all beings, and who cultivates compassion as the heart of the path. Tonglen — "sending and taking" — breathes in others’ pain and breathes out relief.',
    source:
      'Mahāyāna Buddhism; Śāntideva, "The Way of the Bodhisattva" (Bodhicaryāvatāra, 8th c.); the Tibetan lojong (mind-training) tradition for tonglen. Entirely optional, and never required.',
    practice:
      'A gentle daily vow — "today I will try to be of benefit" — plus small acts of compassion and tonglen breathing, growing a Compassion level rather than an ego.',
  },
  stoic: {
    concept:
      'The Stoics taught that we suffer not from events but from our judgments about them, and that freedom lies in mastering the one thing truly ours: our own response. Practices include the dichotomy of control, negative visualization, the view from above, and the evening review.',
    source:
      'Marcus Aurelius, "Meditations" (2nd c.); Epictetus, "Enchiridion" and "Discourses"; Seneca, "Letters to Lucilius."',
    practice:
      'Small daily exercises — sorting what is and isn’t in your control, rehearsing loss to renew gratitude, an honest evening review — that build a steady mind.',
  },
  library: {
    concept:
      'Many contemplative traditions point, in their own language, at the same handful of liberating insights: impermanence, non-attachment, the witnessing awareness behind thought, an unspoiled nature within, and the softening of the line between self and world.',
    source:
      'The Upanishads (c. 800–200 BCE); the Diamond Sūtra (Vajracchedikā); the Lotus Sūtra (Saddharma-puṇḍarīka); the Mahāmudrā meditation tradition; and Advaita / non-dual teachings. Each lesson is a brief, plain-language distillation — explore what resonates.',
    practice:
      'Five-minute lessons: a short teaching, a reflection, and one tiny exercise — every ancient text made practical and lived rather than merely read.',
  },
};

export function getPathContext(id: string): PathContext | undefined {
  return PATH_CONTEXT[id];
}
