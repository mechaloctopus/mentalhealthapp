# Production Audit & Critique — MoodSignal

A candid pass over the whole project against the bar: *ultra-premium, thoughtful,
elegant, intuitive, modular, maintainable, award-winning, production-ready.*

## Verdict
Strong foundation: cohesive dark aesthetic, real on-device logic, broad feature set,
crash-safe startup, tsc-clean. To reach production + award standard, the gaps are
**accessibility, motion-respect, design-system consistency, and build/release hygiene** —
not net-new features.

## Findings & actions

### 1. Build & release hygiene  ✅ fixed this pass
- **`assetBundlePatterns: ["**/*"]`** was bundling `/branding` (20 MB of logos) into the
  app → APK bloat. → scoped to `assets/**/*`.
- **No EAS config.** → added `eas.json` (development / preview-APK / production-AAB) and
  `.easignore` so `/branding` and `/dist` aren't uploaded to builds.
- **Build artifact committed to git** (`dist/*.apk`, ~77 MB each commit) bloats history.
  → Recommended: move downloads to **GitHub Releases**; keep `dist/` out of git. (Left in
  place for now so the chat download link keeps working — flip when ready.)

### 2. Accessibility (was 0 labels)  ✅ first pass
- Added `accessibilityRole`/`accessibilityLabel`/state to `GradientButton`, the tab bar,
  and modal close buttons. Next: sweep card Pressables and decorative-image `accessibilityElementsHidden`.

### 3. Motion respect (was 0)  ✅ first pass
- Added `useReducedMotion()` gating to the always-on `AnimatedBackground`, `BrandMark`,
  `Waveform`, `EmotionAura`, `Companion`, and `BreathOrb`. Honors the OS "reduce motion"
  setting — table-stakes for award-level polish and accessibility.

### 4. Design-system consistency  ✅ first pass / ongoing
- ~45 duplicated `rgba(255,255,255,x)` literals → tokenized as `colors.surface1..4` /
  `colors.hairline`. Typography: tightened Alegreya SC tracking; quotes use the serif
  (not small-caps) for readability.
- **Ongoing:** a few screens re-implement the modal header + footer pattern. A shared
  `ModalScreen` scaffold (added) should absorb them over time to cut duplication.

### 5. Architecture / maintainability
- Good: typed storage adapter, isolated contexts (App + Side), data-driven content.
- **Improve (roadmap):** split `AppContext` actions into a reducer; extract a single UI-kit
  index; colocate screen styles via shared style factories; add unit tests for pure logic
  (emotions mapping, insights, screener scoring) under `jest-expo`.

### 6. Performance
- `AnimatedBackground` (SVG grid + 2 animated glows) renders on every screen — acceptable,
  now skipped under reduce-motion. `messages` uses FlatList. Consider `FlashList` and
  memoizing heavy lists at scale.

## Prioritized roadmap to "done"
1. **This pass:** build hygiene, a11y baseline, reduce-motion, token/typography polish, EAS. ✅
2. Onboarding personalization (goals → tailored home); empty/skeleton states everywhere.
3. Shared `ModalScreen` refactor across all modal routes; UI-kit index.
4. Unit tests (jest-expo) for pure logic; CI workflow.
5. Real backend (Supabase): accounts, sync, live community, Claude mentor; move secrets server-side.
6. Store readiness: real Mended Light logo icon/splash, screenshots, privacy policy, store listings, EAS submit.
