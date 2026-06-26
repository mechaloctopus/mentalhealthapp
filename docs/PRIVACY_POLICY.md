# MoodSignal Privacy Policy

**Status: draft.** This is written to accurately describe what the app actually does today
(verified against `src/lib/dataInventory.ts` and `src/lib/storage.ts`), not aspirational
language. It is **not legal advice** and should be reviewed by a lawyer before being hosted at
a public URL and submitted with an App Store / Play Store listing — see
`docs/ULTRA_PREMIUM_CHECKLIST.md` for that open item.

_Last updated: see git history of this file._

## The short version

MoodSignal stores your wellness data — check-ins, journal entries, screener results, practice
history, and Inner Path progress — **only on your device**, using local encrypted-at-rest OS
storage (AsyncStorage on top of the OS keystore/keychain layer). Nothing is uploaded to us. We
have no server that receives your check-ins, journal, or voice recordings. You can export
everything as a JSON file or delete everything from the Profile screen at any time.

## What we collect and why

| Data | What it is | Where it lives | Why |
|---|---|---|---|
| Local profile (name, optional email) | Set during sign-in/onboarding | On-device only | Personalize the app |
| Voice baseline | Acoustic features from your one-time baseline recording | On-device only | Compare future check-ins to your own baseline |
| Check-ins | Voice or self-reported emotion + derived metrics | On-device only | Show trends, drive recommendations |
| Journal entries | Free text you write | On-device only | Reflection, your own history |
| Screener results (PHQ-9 / GAD-7) | Optional, opt-in self-report scores | On-device only | Optional longitudinal self-tracking, not diagnosis |
| Practice sessions | Which practices you did and for how long | On-device only | Trends, recommendations |
| Inner Path / Resonance state | Quest progress, skill trees, resonance | On-device only | The Inner Path module's own progress |
| Preferences | Notification time, haptics, focus goal | On-device only | App behavior |

**Voice audio itself is never persisted.** The microphone stream is analyzed in memory
on-device for loudness/timing features and discarded; only the derived numeric features
described above are saved.

We do not run analytics, crash reporting, or advertising SDKs that phone home with your usage
data. If that changes in a future version, this document and the in-app disclosure will be
updated before it ships, not after.

## Third parties

- **Google Sign-In** (optional): if you sign in with Google, Google handles that
  authentication; we receive only your name/email/avatar from the OAuth response, stored
  on-device as above.
- **Firebase** is present as a dependency for future account/sync features but is not currently
  wired up to send check-in, journal, or screener data anywhere — see `docs/FIREBASE_SETUP.md`
  and `docs/PRIVACY_ARCHITECTURE.md` for the planned architecture if/when sync ships.
- **Amazon Associates** (planned, not yet built): if affiliate book links ship in the future
  per `docs/AFFILIATE_MARKETING.md`, tapping one takes you to Amazon in your browser/Amazon's
  own app — we don't see or collect anything about that click beyond what Amazon's own
  Associates tag captures, which is documented there.

## Your controls

- **Export**: Profile → Research & data → Export my data (JSON), or directly from the
  Research & data screen.
- **Delete everything**: Profile → Reset all data. This clears your baseline, check-ins,
  practices, journal, screeners, saved messages, quests, resonance, and preferences from this
  device immediately.
- **Crisis resources**: Profile → Crisis support, always reachable, not gated behind any flow.
- **Notifications**: can be turned off entirely from Profile.

## Children

MoodSignal is not directed at children under 13 and does not knowingly collect data from them.

## Changes to this policy

If the data model changes (e.g., an opt-in sync/backend feature ships), this document will be
updated first, and the in-app disclosure/consent flow will reflect the change before it's
collected — consistent with the local-first principle in `docs/PRIVACY_ARCHITECTURE.md`.

## Contact

A support/contact address will be added here once one exists for the published app listing —
see `docs/ULTRA_PREMIUM_CHECKLIST.md` → App Store Launch.
