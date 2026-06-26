# Affiliate Marketing Feasibility — Amazon Associates

Researched question: can recommended books/products in MoodSignal carry Amazon
affiliate links? Short answer: **yes, but only with extra steps most affiliate
sites skip, and only as outbound links — never embedded shopping.** This doc
records the policy constraints found and a concrete implementation plan that fits
them and the app's existing privacy/content principles.

**This is a summary of publicly documented Amazon Associates policy as understood
at research time, not legal advice.** Amazon's Associates Program Operating
Agreement and its mobile-app-specific policy are the controlling documents and
change periodically — re-verify against Amazon's live Associates Central account
("Help" → Program Operating Agreement / Mobile/App policy) before shipping
anything affiliate-related, and treat anything below as a starting point, not a
final compliance check.

## What's allowed

- Amazon Associates explicitly supports linking to Amazon product pages from
  **mobile apps**, but mobile-app use requires **separate, explicit prior written
  approval** from Amazon beyond standard Associates signup — it is not automatic
  the way it is for a website.
- Links must open Amazon's own site/app (in an external browser or Amazon's own
  app via deep link) — **the app must not render Amazon product/checkout pages
  inside an in-app WebView.**
- The app must be free to download, available through an approved app store
  (Apple App Store / Google Play), and **every Amazon link the app surfaces must
  be reachable without requiring payment or a paywall** to access that content.
- The app must not be primarily a shopping app, must not mimic or duplicate
  Amazon's own shopping experience, and recommendations must be a secondary
  feature relative to the app's core purpose (true here: book/practice
  recommendations are a small adjunct to a wellness app, not the product).
- A 2026 program update (effective mid-April 2026, per Amazon's published
  Associates communications) tightened terms further: purchases must complete
  within a defined qualification window after the click, and purchases driven by
  **paid/boosted ad placements** are excluded from commission — relevant if any
  future paid-acquisition strategy is considered, since it would not interact
  with affiliate commissions the way organic recommendation taps would.
- FTC disclosure rules (separate from Amazon's own policy, but mandatory in the
  US) require **clear, conspicuous disclosure of the affiliate relationship**
  near each link, not buried in a single terms-of-service mention.

## What this means for MoodSignal specifically

1. **Approval gate.** Standard Associates signup is not sufficient — mobile-app
   use needs Amazon's specific written sign-off. This should happen only once the
   app is otherwise close to launch-ready (Amazon will look at the actual app),
   and is an explicit go/no-go step, not something to build silently around.
2. **No in-app shopping surface.** Any "recommended book" card must link out
   (`Linking.openURL` to an `amazon.com` product/search URL with the Associates
   tag) rather than render a product page or checkout flow inside the app. This
   is already consistent with how the app has no existing in-app browser/WebView
   pattern.
3. **Secondary feature, not a storefront.** Recommendations should stay scoped to
   "further reading for a wisdom path or practice" (e.g., a "Read more" link on a
   Stoic Path or Cosmic Rim screen pointing to the actual cited book), not a
   dedicated shop tab. This also keeps it aligned with `docs/CONTENT_SYSTEM.md`'s
   existing "practice over consumption" principle.
4. **Always-visible disclosure.** Any screen with an affiliate link needs inline
   text near the link itself (not just in a settings page) — e.g. "As an Amazon
   Associate, MoodSignal may earn from qualifying purchases," directly under or
   beside the link.
5. **Privacy consistency.** Outbound links to Amazon are the user leaving the app;
   no purchase, browsing, or click data should be collected or sent anywhere by
   MoodSignal itself beyond the link's own Associates tag (which Amazon, not
   MoodSignal, uses for attribution) — consistent with the local-first stance in
   `docs/PRIVACY_ARCHITECTURE.md`. This should be stated in the privacy policy
   once one exists (see `docs/PRODUCTION_CHECKLIST.md` → Privacy and Data
   Handling).

## Where this would attach in the existing app

The natural attachment points are places that already cite real source material:

- `docs/CONTENT_SOURCES.md` paths (e.g., Covey's *7 Habits*, Marcus Aurelius'
  *Meditations*, Frankl's *Man's Search for Meaning*) — each already names a
  specific book; a "Read the source" link is a small, honest addition, not a new
  content category.
- `src/data/cosmicRim.ts` → Agrippa's *Three Books of Occult Philosophy* and other
  cited works, surfaced from `app/cosmic/planet/[id].tsx`'s "SOURCE MATERIAL" card.
- Any future dedicated "Library"/"Further reading" screen, if one is built, rather
  than scattering shopping links through the core wellness flows (check-in,
  journal, practices) where they would feel out of place and undermine trust.

## Implementation plan (not yet built)

1. Apply for Amazon Associates (standard) and, once the app has a stable
   build/store listing, apply separately for mobile-app approval. **Do not ship
   affiliate links before that approval exists** — this is the actual blocking
   step, not a technical one.
2. Add a small `src/lib/affiliate.ts` helper: takes an ASIN or search term, builds
   an `amazon.com` URL with the Associates tag, opens it via `Linking.openURL`
   (no WebView). Centralizing this in one helper makes the tag/disclosure
   consistent and easy to audit or remove later if Amazon's terms change.
3. Add a small reusable `AffiliateLink` UI component that always renders the
   FTC-required disclosure text next to the link — so disclosure can never be
   forgotten on a future content addition.
4. Attach 3-5 real book links to existing, already-cited source material first
   (Phase 5 content expansion, see `docs/ROADMAP.md`), rather than inventing a
   shopping catalog.
5. Add a line to the privacy policy and to `docs/PRODUCTION_CHECKLIST.md`'s
   Privacy section once a privacy policy exists, disclosing the affiliate
   relationship and that outbound taps leave the app.
6. Track this as its own checklist item rather than rolled into Cosmic Rim or
   Content System — it is policy-gated, not content-gated.

## Open risk

Amazon can revoke mobile-app approval or change terms (as it did for the 2026
update) with limited notice; the helper-function isolation above is specifically
so that pulling all affiliate links out cleanly (if Amazon's policy changes
unfavorably) is a one-file change, not a content audit.
