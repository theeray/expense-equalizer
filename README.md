# Eric's Expense Equalizer

**Share. Split. Simple.**

A private, mobile-first expense splitter for friends and family. It supports people or groups representing different numbers of people, equal group splits, weighted-by-people splits, and custom weights.

## Phase 1.1 changes

- New welcome/splash screen with Get Started button
- Eric head branding and a darker forest-green palette
- Single-person and two-person/group icons
- No example people or expenses in the deployment build
- Fresh local-storage key so the old demo data does not automatically reappear after this update
- Updated app icons and PWA cache names to reduce stale-image issues on GitHub Pages

## Publish with GitHub Pages

1. Create a normal public GitHub repository (for example `expense-equalizer`).
2. Upload **the contents of this folder** to the repository root. `index.html` should be visible at the top level of the repository.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose **main** and **/(root)**, then Save.
6. After GitHub publishes, open the Pages URL it provides.

If replacing an older version, upload/replace all files in this package. Your browser may cache the prior service worker briefly; a hard refresh or reopening the page usually clears it. The new service worker uses a new cache version.

## Privacy

All trip data is stored in the browser on the current device. There is no account, server, analytics service, or shared database in Phase 1.
