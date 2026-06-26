# Ultra-Premium App Checklist — and Where Each Thing Lives

This is a cross-reference, not a new source of truth. The detailed per-area
checklists already exist in `docs/PRODUCTION_CHECKLIST.md`,
`docs/ROADMAP.md`, `docs/PRIVACY_ARCHITECTURE.md`, and `docs/CONTENT_SOURCES.md`.
This doc answers a different question: **for an app that wants to feel
ultra-premium (trustworthy, legally sound, polished, genuinely useful), what
category of thing is needed, and where in this repo does it already live, get
tracked, or need to be created?** It closes by answering, honestly, whether
the app is there yet.

## How to read this

Each row: the thing → where it's tracked or where it lives → status.
"Tracked" means a checklist item already exists for it somewhere; "Lives" means
the actual artifact (doc, file, or screen) already exists; "Missing" means
neither exists yet and it should be created at the path noted.

### Legal & policy documents

| Thing | Where | Status |
|---|---|---|
| Privacy policy | Tracked: `docs/PRODUCTION_CHECKLIST.md` → Privacy and Data Handling, `docs/ROADMAP.md` Phase 1 → Storage and Privacy. Lives: **nowhere yet.** | **Missing.** Needs an actual `PRIVACY_POLICY.md` (or hosted page, since app stores require a public URL, not just an in-repo doc) once the data model in `docs/PRIVACY_ARCHITECTURE.md` is finalized. This is the single highest-leverage missing legal artifact — App Store/Play submission is blocked without a live URL. |
| Terms of service | Tracked: same two docs as above. Lives: nowhere yet. | **Missing**, same blocker as privacy policy. |
| App Store privacy "nutrition" labels | Tracked: `docs/ROADMAP.md` Phase 7. | **Missing** — depends on the data inventory in `src/lib/dataInventory.ts` being accurate, which it currently is for what's implemented. |
| Works cited / content sourcing | Lives: `docs/CONTENT_SOURCES.md` (Inner Path curriculum), `docs/COSMIC_RIM.md` → Sources section, `src/data/cosmicRim.ts` (`source` field per planet). | **Present and current** for everything actually shipped. Extend both as new content (Sumerian constellation lore, affiliate book links) is added — don't start a third citation file. |
| Affiliate disclosure (FTC) | Lives: plan in `docs/AFFILIATE_MARKETING.md`. | **Planned, not built** — no affiliate links exist yet, so no disclosure is owed yet; the plan requires disclosure be inline wherever a link eventually ships. |
| Crisis/safety disclaimers | Tracked: `docs/PRODUCTION_CHECKLIST.md` → Safety and Mental Health Language. Lives: partial, in screener flows (PHQ-9 item 9 messaging). | **Partial** — no dedicated crisis-resource screen yet; this is the most safety-relevant open item in the whole checklist family, ahead of anything cosmetic. |

### Privacy & data architecture

| Thing | Where | Status |
|---|---|---|
| Data model decision (local-only vs. sync) | Lives: `docs/PRIVACY_ARCHITECTURE.md` (recommends local-only encrypted as the v1 path). | **Decided, not yet enforced everywhere** — e.g. journal/check-in encryption at rest is still open per `docs/PRODUCTION_CHECKLIST.md`. |
| Data inventory | Lives: `src/lib/dataInventory.ts`. | **Present**, and enforced by `scripts/check-invariants.mjs` (`assertFileExists`). |
| Export / delete-my-data | Lives: Research & data screen (export); delete-my-data tracked but not built per `docs/ROADMAP.md` Phase 1. | **Partial.** |
| Release readiness model | Lives: `src/lib/releaseReadiness.ts`. | **Present.** |

### Content quality & honesty

| Thing | Where | Status |
|---|---|---|
| Editorial principles (non-dogmatic, honest attribution, humble claims) | Lives: `docs/CONTENT_SOURCES.md` → Editorial principles; mirrored in `docs/COSMIC_RIM.md` framing and in-screen disclaimers (`app/cosmic/planet/[id].tsx`, `app/cosmic/moon.tsx`). | **Present and consistently applied** to the two largest content surfaces (Inner Path, Cosmic Rim). |
| No-fake-data enforcement | Lives: `scripts/check-invariants.mjs` (`fake|simulated|seeded` pattern check), real ephemeris in `src/lib/astronomy.ts`. | **Present and automated** — this is a real structural guarantee, not just a stated value. |
| Clinical-overclaim avoidance | Tracked: `docs/PRODUCTION_CHECKLIST.md` → Safety. | **Mostly present** in screener language; a full copy review pass across all screens is still open. |

### Product polish (what makes it feel "ultra-premium" rather than "functional")

| Thing | Where | Status |
|---|---|---|
| Visual design system | Lives: `src/theme/theme.ts`, `src/components/ui.tsx`, sacred-geometry effects (`src/components/sacred/`, `src/components/effects/`). | **Strong** — a real, consistent design language exists and is used everywhere new (Cosmic Rim included), not reinvented per screen. |
| Branding | Lives: `docs/BRANDING.md`, `/branding`. | **Mostly present**; per `docs/STATE.md` the licensed logo PNG still needs to land in the actual icon/splash assets. |
| Accessibility | Tracked: `docs/PRODUCTION_CHECKLIST.md` → Accessibility. Lives: partial (haptic preference, some `accessibilityRole`/`accessibilityLabel` use, e.g. throughout the new Cosmic Rim screens). | **Partial** — no VoiceOver/TalkBack pass, contrast check, or dynamic-type test has actually been run on-device yet; this is real, not paperwork, and is the most likely place a reviewer or a real user would find the app's premium-feeling claims thin. |
| Empty/loading/error states | Tracked: `docs/PRODUCTION_CHECKLIST.md` → Core App Reliability. Lives: `src/components/EmptyState.tsx`, used in Journal; not yet everywhere. | **Partial.** |
| Onboarding clarity | Lives: `app/goals.tsx`, `focusLine()` personalization (`docs/STATE.md` §10). | **Present** for the core loop; Cosmic Rim has no onboarding/explainer beyond its own `InfoButton` — acceptable for a secondary module, worth a one-line addition later. |
| Testing | Tracked: `docs/PRODUCTION_CHECKLIST.md` → Testing, with recommended test targets listed. Lives: `npm run check` (tsc + invariants) only — **no unit tests exist yet** for any listed target. | **Weakest structural gap.** Type-checking and an invariant linter are not the same as tests of actual behavior (emotion scoring, screener bands, recommendation selection, astronomy math). |

### Where this leaves the roadmap

Nothing above requires a new roadmap — `docs/ROADMAP.md` already sequences
Phase 1 (legal/safety/reliability) ahead of Phase 4-7 (polish, content
expansion, launch). The honest summary is: **the legal and safety gaps in
Phase 1 are the actual blockers**, not feature count. Cosmic Rim, the moon
widget, and affiliate planning (this session's work) are Phase 3b/5-adjacent —
real, but not on the critical path to "launchable." If priority ordering
matters, Phase 1's privacy policy + terms + crisis screen should come before
any further content modules.

---

## Honest assessment: is this "a truly clean, entertaining, engaging app that
## will help users become better people and better operators"?

Answering each part directly, not diplomatically:

**Clean.** The codebase itself is clean — typed, invariant-checked, a real
design system, no dead/duplicate state (the `src/side/content.ts`
single-source-of-truth pattern is genuinely enforced, not just claimed). The
*product surface* is not yet clean in the App-Store sense: no privacy policy or
terms exist, so it cannot legally launch today regardless of feature quality.
"Clean" code and "clean" (compliant, shippable) product are two different
bars, and only the first is met.

**Entertaining.** Partially, and unevenly. The Inner Path (resonance, skill
trees, mission stages) and now Cosmic Rim (a real, accurate planetary wheel
with myth/lore underneath) are genuinely novel — most wellness apps don't have
either. But entertainment value hasn't been tested with a single real user
outside this development process. No usability testing, no on-device session
with someone unfamiliar with the codebase, has happened. That's not a small
caveat — "entertaining" is an empirical claim about other people's experience,
and zero data exists either way yet.

**Engaging,** in the healthy sense the product vision insists on (not
compulsive engagement): the design intent is sound — `docs/PRODUCT_VISION.md`
explicitly rules out points-only gamification and compulsive-use rewards, and
Resonance is framed as feedback, not worth. Whether it's actually engaging
day-to-day depends on retention data that doesn't exist because the app hasn't
shipped to real users yet. The mechanisms for healthy engagement are built;
evidence that they work is not.

**Will help users become better people.** The content is real and well-sourced
— Stoicism, Frankl, Covey, the Gospel of Mary, Buddhist practice, Agrippa's
correspondences for Cosmic Rim — and it's translated into small concrete
actions rather than left abstract, which is the right design choice for actual
behavior change. But "will help" is a causal claim the app hasn't earned the
right to make yet: there's no outcome measurement (e.g., do PHQ-9/GAD-7 scores
trend down over weeks of use, do people who do Five Temples quests report
different outcomes than people who don't). Good scaffolding for helping people;
no evidence yet that it does.

**Better operators** (i.e., functioning better in daily life/work, not just
feeling better): this is the least-developed of the four. Purpose/stewardship
prompts and habit-formation content exist, but there's no goal-tracking,
no measurable-skill progression tied to real-world outcomes (e.g., did a
specific habit actually form), and no operator-specific content track (the
content skews contemplative/emotional, not performance/productivity). If
"better operator" is a serious differentiator the team wants to claim, it's
currently the thinnest part of the product relative to the vision doc's
ambition.

**Bottom line:** the foundations are genuinely strong and unusually honest for
this stage (real astronomical data instead of fake horoscope content, real
cited sources instead of invented wisdom, a real privacy-first architecture
instead of marketing language about one) — that honesty is itself a premium
trait many competitors lack. But "truly clean, entertaining, engaging, and
life-changing" is a claim about shipped, tested, legally-cleared, user-validated
software, and this is pre-ship, pre-legal, pre-user-data software with strong
bones. The gap between "well-built" and "ultra-premium, proven" is exactly
Phase 1 (legal/safety) plus real user testing — not more features.
