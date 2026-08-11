# Eric's Expense Equalizer — Phase 1 v1.4

**Share. Split. Simple.**

This build uses the user's approved splash artwork directly. It no longer redraws the
lake, mountains, trees, typography, or head artwork with simplified SVG/CSS geometry.

## Visual changes in v1.4

- The approved `Eric's Expense Equalizer copy.png` artwork is used directly as the splash.
- A 2× display copy is included for high-DPI phone screens.
- The visible "Get Started" button is part of the approved artwork; the app places an
  invisible accessible tap target directly over it.
- App/home-screen icons are rebuilt on a solid dark background so there are no white corner artifacts.
- Darker forest green is retained throughout the working UI.
- No example people or example expenses are included.

## GitHub upload

Replace your current repository root files with every file from this project folder.
Keep all files at the repository root.

Then use:
Settings → Pages → Deploy from a branch → main → /(root)

After publishing, test in an Incognito/InPrivate window. If the older installed PWA
still appears on a phone, remove it from the home screen and add the new version again.
