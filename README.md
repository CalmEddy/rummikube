# Tile & Tally

A responsive Rummikube scorekeeper for 2–6 players. Create reusable player profiles, track multiple sessions, add or edit signed round scores, and finish sessions to update lifetime statistics. Completed sessions can be reopened or edited. Tied leaders share a win.

## Develop

Requires Node.js 20.19+ or 22.12+ (tested with Node 24).

```sh
npm ci --cache /tmp/rummikube-npm-cache
npm run dev
```

The development server listens on all interfaces, port 5173 by default. On a shared network, open the host machine's network address from your phone. To use it publicly, deploy `dist/` to an HTTPS static host after running `npm run build`.

```sh
npm test
npm run build
npm run preview
```

Tests cover score totals, editing, completed-session aggregation, active-session exclusion, and ties. The app has also been exercised in Chromium at mobile and desktop widths.

## Scoring and storage

Enter positive or negative integer points for each player; higher totals win. The app accepts house rules and does not enforce zero-sum rounds. Only completed sessions affect lifetime wins, totals, averages, and best-game statistics.

Data stays in localStorage in the current browser and origin. It does not sync between devices. Export and import JSON backups to transfer data; importing replaces current data after confirmation. Clearing browser storage deletes saved scores. No accounts, credentials, or backend services are needed. Google Fonts are optional; system fonts serve as fallbacks.

## Deploy to GitHub Pages

The app is configured for **https://calmeddy.github.io/rummikube/**.

1. In the GitHub repository, open **Settings → Pages** and set **Source** to **GitHub Actions** (requires repository admin access).
2. Commit and push the application files, `vite.config.js`, and `.github/workflows/deploy-pages.yml` to `main`.
3. In **Actions**, watch **Deploy to GitHub Pages**. After it succeeds, open the URL above on any device. You can also run the workflow manually from the Actions tab.

Each push to `main` installs locked dependencies, runs tests, builds the app, and deploys `dist/` using GitHub's Pages artifact deployment. No deployment token or additional package is needed. GitHub Pages must be available for your repository visibility and plan.

Vite's base path is `/rummikube/`, so local development and preview also use that path. If you rename the repository or use a custom domain, update `base` in `vite.config.js` accordingly.

Scores remain local to each browser. Export a backup from the old address before switching to the Pages address, then import it there.
