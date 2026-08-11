# Firebase Enabled — Phase 2.2 Test Checklist

This build is connected to:

- Firebase project: `expense-equalizer`
- Firebase Authentication: Anonymous
- Cloud Firestore: shared `trips` documents
- GitHub Pages: still hosts the app

The Firebase JS SDK is loaded as browser modules from Google's official CDN.
This build does not use Firebase Analytics.

## Before uploading

In the Firebase Console, verify:

1. Authentication → Sign-in method → Anonymous = Enabled
2. Firestore Database → Rules match the included `firestore.rules`
3. Authentication → Settings → Authorized domains includes your GitHub Pages host

Example:
`YOURUSERNAME.github.io`

## Upload to GitHub

Replace the existing repository-root files with every file from this folder.

New Phase 2 files that MUST be included:
- `firebase-config.js`
- `firebase-sync.js`
- `firestore.rules`

Also keep:
- `index.html`
- `app.html`
- `app.js`
- `style.css`
- all icon/splash files
- manifest + service worker

## First live test

1. Publish the new files to GitHub Pages.
2. Open the app in an Incognito/Private window.
3. Enter the app and go to **More**.
4. The Shared trip section should no longer say Firebase is unconfigured.
5. Tap **Create shared trip link**.
6. The app should:
   - anonymously authenticate,
   - create the trip in Firestore,
   - show `Synced`,
   - and copy an invite URL.

## Second-device test

1. Paste the invite link into a different browser or phone.
2. The shared trip should load.
3. Add a person or expense on device A.
4. The change should appear on device B automatically.
5. Add an expense on device B.
6. It should appear on device A.

If this works, the core Phase 2 synchronization milestone is complete.

## If something fails

Check the Shared trip status in More:

- `Synced` = Firebase is working.
- `Offline` = device has no network.
- `Setup needed` = Firebase configuration/auth/rules problem.
- `Sync error` = Firestore denied or failed a write/listener.

Then check the browser developer console for the Firebase error message.
