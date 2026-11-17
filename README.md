# Tile & Tally

A responsive Rummikube scorekeeper for 2–6 players. Create reusable player profiles, track multiple sessions, calculate and edit round scores, and finish sessions to update lifetime statistics. Completed sessions can be reopened or edited. Tied leaders share a win.

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

Select the player who went out, then enter each opponent’s remaining numbered tile total and joker count separately. Numbered tiles use face value; each remaining joker is 30 points. Opponents receive the negative value of their racks, and the player who went out receives the combined positive total. For example, racks of 12 and 8 plus one joker produce −12, −38, and +50 for the winner.

When the pool is empty and no one can play, choose the blocked-game option. The lowest rack wins: subtract that rack value from every other rack; opponents lose those differences and the winner receives their sum. For racks of 5, 12, and 20 the scores are +22, −7, and −15. Tied lowest blocked racks require manual house-rule scoring rather than selecting a winner arbitrarily.

Calculated rounds sum to zero. Editing rack values recalculates all round scores and session statistics. Existing signed-score rounds remain unchanged and open in manual mode; manual scoring also supports house rules. Only completed sessions affect lifetime wins, totals, averages, and best-game statistics.

Rules reference: [official Rummikub rules](https://rummikub.com/rules/). The official site was inaccessible from the development environment during this change; the implementation follows the standard scoring rules described above.

Data stays in localStorage in the current browser and origin. It does not sync between devices. Export and import JSON backups to transfer data; importing replaces current data after confirmation. Clearing browser storage deletes saved scores. No accounts, credentials, or backend services are needed. Google Fonts are optional; system fonts serve as fallbacks.

## Deploy to GitHub Pages

The app is configured for **https://calmeddy.github.io/rummikube/**.

1. In the GitHub repository, open **Settings → Pages** and set **Source** to **GitHub Actions** (requires repository admin access).
2. Commit and push the application files, `vite.config.js`, and `.github/workflows/deploy-pages.yml` to `main`.
3. In **Actions**, watch **Deploy to GitHub Pages**. After it succeeds, open the URL above on any device. You can also run the workflow manually from the Actions tab.

Each push to `main` installs locked dependencies, runs tests, builds the app, and deploys `dist/` using GitHub's Pages artifact deployment. No deployment token or additional package is needed. GitHub Pages must be available for your repository visibility and plan.

Vite's base path is `/rummikube/`, so local development and preview also use that path. If you rename the repository or use a custom domain, update `base` in `vite.config.js` accordingly.

Scores remain local to each browser. Export a backup from the old address before switching to the Pages address, then import it there.
