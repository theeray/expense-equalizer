# Eric's Expense Equalizer — Phase 1 v1.5

**Share. Split. Simple.**

This complete GitHub Pages build uses the two user-supplied image files directly.

## v1.5 visual fixes

- Uses the newly centered `Eric's Expense Equalizer Start Page` artwork directly.
- Removes all CSS/SVG darkening, fade, shade, and vector overlays from the splash.
- Uses the newly supplied black-background Eric icon directly.
- Rounded corners are applied by CSS in the working app header, so the source icon itself
  stays clean and has no white corner artifacts.
- Rebuilds the PWA/home-screen icons from the same supplied icon.
- Keeps the darker forest-green UI.
- Keeps the app blank by default: no sample people and no sample expenses.
- Uses a new service-worker cache version to force the updated visual assets.

## Upload to GitHub

Replace the existing repository files with every file inside this folder.
Upload the files themselves to the ROOT of the repository; do not upload the ZIP as the site.

GitHub Pages:
Settings → Pages → Deploy from a branch → main → /(root)

After publishing, test in an Incognito/InPrivate window. If you have an older version
installed on a phone home screen, remove it and reinstall after v1.5 is live because
PWA icons and app shells are cached aggressively.
