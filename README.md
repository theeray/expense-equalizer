# Eric's Expense Equalizer — Phase 2.2 (v2.4)

**Share. Split. Simple.**

This is the first Firebase-enabled build.

The completed Phase 1 structure is preserved:
- `index.html` is the welcome/start screen.
- `app.html` is the working expense-splitting app.
- Existing local trips and localStorage continue to work.
- Firebase is additive: a trip only becomes shared when the user chooses to create a shared link.

## Firebase connection

Project: `expense-equalizer`

Services used:
- Firebase Authentication — Anonymous sign-in
- Cloud Firestore — shared trip storage + realtime listeners

Services not used:
- Firebase Hosting
- Firebase Analytics
- Cloud Functions

## Phase 2.2 features

- Create a private shared-trip link
- Join a shared trip from the link
- Realtime sync across phones
- Local / Syncing / Synced / Offline status
- Local-only trips still work
- Keep a shared trip as a local-only copy
- Firestore rules included

The next Phase 2 step can add QR-code invitations once live link syncing is confirmed.
