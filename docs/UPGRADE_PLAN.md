# MoodSignal — Ultra-Premium Upgrade Plan

> Goal: take MoodSignal from a beautiful MVP to the **top of its class** —
> deeper emotion science, the premium features users expect, and a smoother,
> more intuitive experience. This document is the north star; we build it in phases.

---

## 0. Where we are vs. where we're going

| Capability | Today | Upgraded |
|---|---|---|
| Emotions from voice | 3 signals (energy, calmness, stress) | **12 named emotions** on a valence/arousal wheel + confidence |
| Self-report mood | none | **Emotion wheel** (How We Feel / Plutchik style) + factor tagging |
| Insights | calmness sparkline | Correlations, weekly reports, streak & trend dashboard |
| Guidance | static practices | **AI CBT/DBT companion** + adaptive recommendations |
| Journaling | none | Guided journaling with AI reflection prompts |
| Engagement | check-ins | Gentle gamification: companion, streaks, badges, goals |
| Sleep | tips + tones | Sleep stories, wind-down, soundscape mixer |
| Data | on-device only | Optional cloud sync (Supabase), Health/Fit, widgets, export |
| Safety | disclaimer | Crisis-language detection + resources + trusted contacts |

---

## 1. The Emotion Engine (3 → 12) — the headline upgrade

### 1.1 The science (what we're modeling)
- **Dimensional backbone:** every emotion sits on **Valence** (unpleasant↔pleasant) ×
  **Arousal** (calm↔activated), optionally **Dominance**. This is the academically
  robust core (Russell's circumplex; Hume/affective-computing standard).
- **Named layer (12 emotions)** placed as regions on that map (Plutchik-inspired,
  chosen for everyday relatability):

  | Quadrant | Emotions |
  |---|---|
  | High arousal · positive | **Joy, Excited, Proud** |
  | Low arousal · positive | **Calm, Content, Grateful** |
  | High arousal · negative | **Anxious, Frustrated, Overwhelmed** |
  | Low arousal · negative | **Sad, Lonely, Drained** |

- **Emotional granularity** (naming the specific feeling) is itself an intervention —
  it improves regulation and coping. So the wheel is a feature, not just input.

### 1.2 Three sources, fused into one read
1. **Voice (on-device):** expand acoustic features beyond loudness —
   F0/pitch & variability, speech rate, pause ratio, jitter/shimmer, spectral tilt,
   energy contour. These map well to **arousal** (reliable) and approximate
   **valence** (harder). Output: a point on the V/A map → nearest emotion(s) + confidence.
   *Honesty:* on-device valence is approximate; we always show confidence and let
   the user confirm/correct (which also creates training labels).
2. **Self-report wheel:** a gorgeous, fast tap-through emotion wheel (12 core →
   expandable to ~40 nuance words). One tap = ground truth; corrects the voice read.
3. **Optional cloud "Deep Analysis" (premium):** stream the sample to a hosted
   speech-emotion model (e.g. **Hume AI Expression Measurement**, or our own model)
   for true 12–48 emotion scoring. Gated behind explicit consent + premium tier,
   routed through a **Supabase Edge Function** so the API key never ships in the app.

### 1.3 Engineering notes / feasibility
- Real pitch/spectral features need DSP. Options, in order of preference:
  - **JS pitch/feature lib** (autocorrelation/YIN) over the PCM we already capture — works in Expo Go for arousal + rough valence.
  - **Dev build + native audio module** (e.g. `react-native-audio-api` / a small JNI/Swift extractor) for full feature set — drops Expo Go but unlocks accuracy.
  - **Cloud model** for the premium deep read.
- Recommend: ship JS-feature VAD + self-report wheel first (no Expo Go loss), add cloud deep analysis as the premium differentiator.

### 1.4 Results UX
- Replace 3 bars with an animated **emotion wheel / V-A "aura"** that lands on the
  detected emotion, secondary emotions listed, confidence ring, baseline delta,
  and a one-line interpretation + a single matched practice (keep our "one next step" ethos).

---

## 2. Premium features users expect (prioritized)

### Tier A — core differentiators
1. **AI companion (CBT/DBT-grounded chat).** Warm, safe conversational guide using
   the latest Claude model via a secure edge function. Modes: vent/reflect, reframe a
   thought, plan one action, wind down. Always with crisis guardrails. *(Wysa/Youper class.)*
2. **Mood + emotion tracking with factors.** Log emotion (wheel) + context tags
   (sleep, work, social, exercise, food, cycle, meds) → powers correlations.
3. **Guided journaling.** Daily prompts, free entry, voice-to-text; AI surfaces
   themes, reframes, and a gentle weekly summary. Private vault.
4. **Insights dashboard.** Trends per emotion, **what correlates with feeling better**
   (sleep↔calm, exercise↔energy), streaks, weekly "story of your week" report.

### Tier B — engagement & retention
5. **Gentle gamification.** A living companion that grows with self-care (Finch-style),
   streaks, badges, and meaningful goals — designed to motivate without guilt/anxiety.
6. **Programs & courses.** Multi-day journeys (e.g. "7 days to calmer mornings",
   anxiety, sleep, self-compassion) blending our practices + content.
7. **Sleep suite.** Sleep stories, wind-down routine, **soundscape mixer** (layer rain +
   pad + binaural), smart alarm window.

### Tier C — platform & trust
8. **Wearables / Health.** Apple Health + Google Fit/Health Connect: HRV, sleep, steps,
   heart rate → richer correlations and an HRV-paced breathing biofeedback session.
9. **Home-screen & lock-screen widgets** (today's word, quick check-in, streak) + Apple Watch.
10. **Safety intelligence.** Detect severe-distress language (voice transcript/journal),
    surface grounding tools, trusted contacts, and local crisis lines.
11. **Clinician export.** Beautiful PDF: emotion trends, screeners (PHQ-9/GAD-7), practices, sleep.
12. **Cloud sync & account.** Supabase (Postgres + Auth + RLS) for multi-device, backup, and the edge functions above. Local-first remains the default; sync is opt-in & encrypted.

---

## 3. Make it *feel* ultra-premium (intuitive & smooth)

- **Motion system:** shared-element transitions between cards and detail screens,
  spring-based gestures, the V-A aura that breathes, confetti-free tasteful celebration moments.
- **Micro-interactions & haptics:** every meaningful action has a calibrated haptic + sound.
- **Onboarding personalization:** ask goals (sleep, anxiety, focus, mood) → tailor home, content, and notification tone.
- **Adaptive home (JITAI):** the "one next step" reorders based on time of day, last check-in, sleep, and streak.
- **Performance:** move heavy lists to FlashList, memoize, precompute the 365 set,
  lazy-load audio/AI; cold-start < 1.5s; 60fps everywhere.
- **Accessibility:** full VoiceOver/TalkBack labels, dynamic type, reduce-motion, high-contrast, color-blind-safe emotion palette.
- **Theming:** refined dark (default) + an optional light "daylight" theme; per-emotion accent system.
- **Internationalization-ready** copy structure.

---

## 4. Architecture & infrastructure

- **Backend: Supabase** (we have it wired in this workspace). Postgres + Row-Level
  Security, Auth (Google + Apple + anonymous), Storage, and **Edge Functions** to
  safely call Claude (AI companion) and the voice-emotion model. Keeps secrets server-side.
- **Local-first sync:** keep AsyncStorage as the source of truth offline; sync deltas
  to Supabase when signed in. (Our `storage.ts` adapter already isolates this.)
- **Auth:** finish real Google (+ add Apple) via the config-driven layer we built.
- **Monetization:** RevenueCat for subscriptions; **Premium** unlocks deep voice
  analysis, AI companion, programs, insights+, sleep suite, sync, export. Generous free tier.
- **Privacy/compliance:** explicit consent for any audio leaving the device, on-device
  default, encryption, easy delete/export, clear "not a medical device" boundaries,
  and crisis resources. Plan for HIPAA-readiness if we add covered features.

---

## 5. Phased roadmap

**Phase 1 — Emotion depth & self-report (the wow):**
12-emotion model, self-report emotion wheel, richer on-device voice features (JS DSP),
redesigned results (aura/wheel + confidence), emotion-aware history & basic insights.
→ *Biggest perceived leap, no Expo Go loss.*

**Phase 2 — Engagement & guidance:**
AI CBT companion + journaling (Supabase edge functions + Claude), factor tagging &
correlations dashboard, gentle gamification (companion/streaks/badges), sleep soundscape mixer.

**Phase 3 — Platform, intelligence & monetization:**
Supabase sync + accounts, optional cloud Deep Voice Analysis (Hume-class), Health/Fit +
HRV biofeedback, widgets/Watch, programs/courses, paywall (RevenueCat), clinician export, safety intelligence.

---

## 6. Success metrics
Day-1/Day-30 retention, check-ins/week, streak length, emotion-granularity (distinct
emotions logged), premium conversion, and qualitative "felt understood" rating.

---

## Sources
- Hume AI prosody / expression measurement (18 prosody emotions, 48 dimensions): https://www.hume.ai/products/prosody , https://www.hume.ai/expression-measurement
- Emotion classification (Ekman, Plutchik, valence/arousal): https://en.wikipedia.org/wiki/Emotion_classification , https://www.6seconds.org/2025/02/06/plutchik-wheel-emotions/
- Valence/arousal datasets survey: https://arxiv.org/html/2510.00738v1
- Emotional granularity & wheels: https://positivepsychology.com/emotion-wheel/
- Popular premium app features (Wysa, Youper, Sanvello, Moodfit): https://www.choosingtherapy.com/best-ai-therapy-apps/ , https://www.myflourish.ai/post/top-ai-mental-health-apps-2026
- Gamification / Finch / Calm sleep: https://persistenceinsights.wordpress.com/2025/04/04/top-trends-in-mental-health-apps-from-gamification-to-personalized-support/ , https://tms-outsource.com/blog/posts/apps-like-finch/
