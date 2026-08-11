# Eric's Expense Equalizer

**Share. Split. Simple.**

A mobile-first expense splitting app for friends, families, couples, and groups. It supports:

- Equal splits among selected groups
- Splits weighted by the number of people represented
- Custom weights/percentages
- Multiple saved trips
- Automatic settle-up payments
- Shareable settlement summaries
- Offline use after the first visit
- Install-to-home-screen support
- Local-only storage: no account, server, or database required

## Put it online with GitHub Pages

You only need a normal free GitHub account.

1. Sign in to GitHub.
2. Click **New repository**.
3. Name it something like `expense-equalizer`.
4. Choose **Public**. (GitHub Pages is simplest on a public repository with a free account.)
5. Check **Add a README file** only if you want; it is fine either way.
6. Create the repository.
7. Click **Add file → Upload files**.
8. Upload the *contents* of this project folder: `index.html`, `style.css`, `app.js`, `manifest.webmanifest`, `service-worker.js`, `README.md`, `LICENSE`, and the entire `icons` folder.
9. Commit the files.
10. Open **Settings → Pages**.
11. Under **Build and deployment**, choose **Deploy from a branch**.
12. Select branch **main** and folder **/(root)**, then click **Save**.
13. GitHub will show your site address after deployment. It will usually be:

   `https://YOUR-USERNAME.github.io/expense-equalizer/`

Deployment commonly takes a minute or two after the first setup.

## Updating the app later

When you receive a new version from ChatGPT, upload the replacement files to the same repository and commit them. GitHub Pages republishes automatically.

Because the app uses a service worker for offline use, a phone that has already installed an older version may briefly show cached files. Reloading the page (or closing and reopening the installed app) normally picks up the update.

## Installing on a phone

### iPhone / iPad
Open the GitHub Pages URL in Safari → **Share** → **Add to Home Screen**.

### Android
Open the URL in Chrome. Chrome may offer **Install app**, or use the browser menu → **Add to Home screen / Install app**.

## Privacy

Trip data is stored in the browser's local storage on that device. It is not sent to GitHub or to Eric. The **Share results** button only shares/copies the final settlement text when the user chooses to do so.
