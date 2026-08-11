# Eric's Expense Equalizer — Phase 1 v1.9

**Share. Split. Simple.**

## Start-screen architecture changed completely

v1.9 uses two separate HTML pages:

- `index.html` = welcome/start artwork only.
- `app.html` = the actual expense-splitting application.

The entire start screen is a normal HTML link directly to `app.html`.
There is no JavaScript hide/show action, no CSS `:target`, and no splash overlay
inside the app page.

This is deliberately simple and robust: if a browser can follow a normal web link,
the Get Started screen can open the app.

The approved splash image and clean Eric icon are unchanged.

## Upload

Replace the repository-root files with every file in this folder. Note that v1.9 adds
one new required file: `app.html`.

GitHub Pages:
Settings → Pages → Deploy from a branch → main → /(root)

Test the live site in an Incognito/InPrivate window first.


## v2.0
- Removed remaining example names.
- Placeholder/example group names now use instructional text such as:
  - Enter Name(s) Here
  - Enter Name Here
  - Enter Expense Description
  - New Expense Group


## v2.1 Onboarding polish
- Removed remaining sample/demo names and expenses.
- Replaced example content with instructional onboarding language.
- Empty states now encourage users to:
  * Add their first person or group
  * Add their first expense
  * View settlement results after entering expenses
