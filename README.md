# Eric's Expense Equalizer — Phase 1 v1.3

**Share. Split. Simple.**

This is the GitHub Pages-ready Phase 1 project.

## What changed in v1.3

- The visible Eric head/logo is embedded directly inside `index.html` as a data URI.
  It does **not** depend on `brand-icon.png` loading from GitHub.
- The lake, mountains, mist, and pine-tree splash artwork is also embedded directly
  inside `index.html` as SVG.
- The PWA/home-screen icon files remain normal root-level PNGs because browsers
  require icon URLs in the web manifest.
- There are no sample people or sample expenses.
- Person/group cards use one-head and two-head icons.
- The theme uses the darker forest green from the approved mockup.
- A new service-worker cache namespace prevents the old build from persisting.

## Upload to GitHub

Upload every file in this folder directly to the ROOT of your repository:

- index.html
- style.css
- app.js
- manifest.webmanifest
- service-worker.js
- brand-icon.png
- icon-192.png
- icon-512.png
- apple-touch-icon.png
- favicon.png
- README.md
- LICENSE

Do not upload the ZIP itself as the website.

GitHub Pages:
Settings → Pages → Deploy from a branch → main → /(root)

## Important after replacing an older PWA

First test the live URL in an Incognito/InPrivate browser window.

If you previously installed the old version to a phone home screen, remove the old
installed app and add it again after v1.3 has published. PWAs cache icons and app
shells very aggressively.
