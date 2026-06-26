# MoodSignal Ultra-Premium Release Checklist

This checklist defines what MoodSignal needs before it can be treated as a clean, premium, engaging public release.

## Current verdict

MoodSignal is directionally strong and now has a coherent loop:

```text
Daily word -> Check in -> One wise next step -> Practice or quest -> Resonance -> Skill-tree growth -> Review patterns
```

It is not yet release-complete. The remaining work is less about adding more ideas and more about making the app legally clean, clinically careful, technically stable, and emotionally excellent.

## P0: Required before public launch

### Safety and mental-health boundaries

- Dedicated Safety screen reachable from profile, check-in results, screeners, and any high-risk copy.
- Locale-aware crisis resources.
- Trusted-person action: call, text, or copy a message.
- Immediate-danger copy that tells users to contact emergency services.
- PHQ-9 item 9 handling if any depression screener is used.
- Clear statement that MoodSignal is a wellness and self-reflection tool, not diagnosis, treatment, or emergency care.
- Human review of all crisis, depression, anxiety, trauma, addiction, and self-harm adjacent copy.

### Privacy and data security

- Privacy Policy page on a public, stable, non-PDF URL.
- In-app Privacy screen with the same policy summary.
- Terms of Use page on a public, stable URL.
- Data retention and deletion language.
- Export/delete local data flow.
- Decide launch mode:
  - local-only with no cloud account, or
  - real authentication and explicit sync consent.
- Replace sensitive AsyncStorage usage with encrypted storage or document why the local-only data model is acceptable for launch.
- Microphone consent copy shown immediately before recording.
- App Store privacy nutrition labels and Google Play Data Safety answers must match actual behavior.

### Build and validation

- `npm ci` passes.
- `npm run lint` passes.
- EAS Android preview APK builds.
- EAS Android production AAB builds.
- iOS build is validated before App Store submission.
- Physical Android microphone test.
- Physical iPhone microphone test.
- Notification opt-in test.
- Deep-link test from notifications.
- Offline test.
- Corrupted local-storage test.
- Low-storage and interrupted-recording test.

### App-store readiness

- App name, subtitle, short description, full description.
- Screenshots for required Android and iOS sizes.
- App icon, adaptive Android icon, splash screen.
- Support URL.
- Marketing URL.
- Privacy Policy URL.
- Terms URL.
- Contact email.
- Demo account or demo mode if account features are enabled.
- Review notes explaining wellness boundaries and microphone use.

## P1: Premium experience requirements

### Product coherence

- Every main screen should answer one question: What should I do next?
- No fake community activity, fake metrics, fake engagement, or synthetic social proof.
- One primary progression system: resonance, mission stage, skill trees, and quests.
- Practices should grant visible progress once per day.
- Check-ins should produce one recommended practice or quest, not a wall of options.

### Engagement and retention

- 365 daily messages/devotionals.
- Daily local notification opt-in with editable time.
- Weekly recap.
- Streaks framed gently as rhythm, not shame.
- First-week onboarding path.
- Clear empty states.
- Milestone moments for resonance and mission-stage advancement.

### Accessibility and quality

- Full VoiceOver/TalkBack pass.
- Dynamic type review.
- High-contrast review.
- Touch target review.
- Reduce-motion support.
- Plain-language review.
- Battery and memory review for audio and animation screens.

### Content governance

- Works-cited file for books, traditions, practices, scientific claims, and mythological references.
- Source notes per content module.
- Distinguish evidence-based wellness practices from symbolic, devotional, mythic, or entertainment material.
- Avoid claiming medical outcomes from frequencies, astrology, devotional practices, or breathwork.
- Keep all symbolic systems optional and clearly framed.

## P2: Monetization readiness

### Amazon affiliate marketing

Amazon affiliate links can be considered for recommended books and physical products, but only if implemented transparently.

Required:

- Enroll in Amazon Associates.
- Use Amazon-provided Special Links or approved API output.
- Show an affiliate disclosure wherever book/product recommendations appear.
- Include a global disclosure such as: `As an Amazon Associate I earn from qualifying purchases.`
- Do not imply Amazon sponsors, endorses, or supports MoodSignal.
- Do not hide, cloak, hijack, or auto-insert affiliate links.
- Keep recommendations editorially honest and not driven only by commission.
- Link out to Amazon for physical books/products; do not sell Amazon products inside the app.

App-store caution:

- Physical goods and external retail links are usually less risky than selling digital content inside the app.
- Digital books, courses, unlocks, subscriptions, or premium content inside the app may require platform in-app purchase rules.
- Final implementation should be checked against current Apple, Google Play, and Amazon Associates policy before submission.

## P3: Premium content modules

### Existing core modules

- Daily word / 365 messages.
- Voice check-in.
- Manual emotion check-in.
- Breath practice.
- Stillness practice.
- Loving-kindness practice.
- Sound/frequency practice.
- Journal.
- Reflection coach.
- Sleep mixer.
- Research/screeners.
- Inner Path.
- Insights.

### Proposed side modules

- Cosmic Rim: lunar phase, planetary positions, zodiac wheel, planetary hours, symbolic history.
- Library: books, practices, citations, affiliate-safe recommendations.
- Stewardship: purpose-through-care quests.
- Operator mode: planning, discipline, habits, weekly execution.

## Premium definition

MoodSignal is truly premium when it does these five things consistently:

1. Helps the user understand their current state.
2. Gives one clear next action.
3. Rewards useful behavior without manipulation.
4. Protects user privacy and safety.
5. Feels beautiful, alive, honest, and grounded.
