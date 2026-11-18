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

In device-only mode, data stays in localStorage in the current browser and origin and does not sync. Export and import JSON backups to transfer data; importing replaces the selected device or shared scorebook after confirmation. Clearing browser storage deletes device-only scores. Shared mode uses Supabase sign-in and storage as described below. Google Fonts are optional; system fonts serve as fallbacks.

## Deploy to GitHub Pages

The app is configured for **https://calmeddy.github.io/rummikube/**.

1. In the GitHub repository, open **Settings → Pages** and set **Source** to **GitHub Actions** (requires repository admin access).
2. Commit and push the application files, `vite.config.js`, and `.github/workflows/deploy-pages.yml` to `main`.
3. In **Actions**, watch **Deploy to GitHub Pages**. After it succeeds, open the URL above on any device. You can also run the workflow manually from the Actions tab.

Each push to `main` installs locked dependencies, runs tests, builds the app, and deploys `dist/` using GitHub's Pages artifact deployment. No deployment token or additional package is needed. GitHub Pages must be available for your repository visibility and plan.

Vite's base path is `/rummikube/`, so local development and preview also use that path. If you rename the repository or use a custom domain, update `base` in `vite.config.js` accordingly.

Scores remain local to each browser. Export a backup from the old address before switching to the Pages address, then import it there.

## Shared storage with Supabase

The app supports **private shared scorebooks**. Each scorebook contains its own players, sessions, and calculated statistics. Sign in with the same email on multiple devices, or let other signed-in accounts join using a private invite code. Members can read and edit the entire scorebook. Device-only mode remains available; signing out restores the device's original data, not another account's shared data.

### One-time project setup

The browser app is configured for the project in `src/supabase-config.js` using its public publishable key. GitHub Actions variables are optional overrides. Connecting a repository in Supabase does not automatically apply the database schema.

1. In your Supabase project's **SQL Editor**, run the contents of `supabase/migrations/202611170001_shared_scorebooks.sql` once. If using the Supabase CLI instead, link your existing project and run `supabase db push`. The migration creates tables, row-level security policies, and authenticated create/join functions. Do not disable row-level security.
2. In Supabase **Authentication → Providers**, enable **Email** and allow new sign-ups if your group needs them. Keep the default Magic Link email template; no template editing is needed. Supabase supports email-link sign-in without a password. Configure production SMTP if needed for delivery limits or recipient restrictions. In **Authentication → URL Configuration → Redirect URLs**, add exactly `https://calmeddy.github.io/rummikube/`. The app sends this URL with each link request. Keep the existing Site URL if another app uses this project. Without an allowed redirect URL, Supabase can fall back to that other app. For local development, also allow the exact localhost URL you use (for example `http://localhost:5173/rummikube/`).
3. Find the **Project URL** and **publishable key** in the project's connection/API settings. Only the public/publishable (or legacy anon) key belongs in this browser app. **Never supply a secret/service-role key or database password.**
4. Optional: to override the configured project, in GitHub **Settings → Secrets and variables → Actions → Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The workflow also accepts repository secrets with those names and the legacy `VITE_SUPABASE_ANON_KEY` secret. These are build-time values: rerun the Pages deployment after changing them.
5. For local development, copy `.env.example` to `.env.local`, enter those public values, and restart `npm run dev`. Only the public project defaults are committed; local override files are ignored.

### Use and migrate

- Select **Sign in / sync**, enter your email, and open the newest emailed sign-in link. It returns to the app and signs you in automatically.
- Create a scorebook under **Scorebooks & sharing**. Creating one starts empty and preserves your device's original data.
- To migrate, open **Scorebooks & sharing → Import this device's saved data**. This replaces the selected shared scorebook after confirmation; export a backup first if it already contains scores. JSON backup import also targets the currently selected scorebook.
- On another device, sign in with the same account and open that scorebook. For a different account, send the invite code privately and choose **Join scorebook**. Anyone signed in with the code can join, view scores, and edit; treat it as an invitation credential.
- Idle pages refresh every 30 seconds; **Refresh** fetches immediately. Open dialogs and unsaved edits are not automatically replaced. Concurrent saves use an optimistic revision check. A failed/conflicting save stays visible with an explicit unsaved warning; retry or export it before refreshing. The app never silently overwrites a newer remote revision.
- Shared mode needs a network connection; offline edits are not queued. Local mode and exports are available separately. This document-based design suits a small game group, not very large archives or high-volume concurrent editing.

### Validation status

Unit tests cover shared reads, revision conflicts, and network failures in addition to scoring. Browser checks can use a mock Supabase endpoint. Applying the SQL migration, verifying email-link delivery and redirect allowlisting, RLS isolation between real accounts, and cross-device persistence on your actual project require its configuration; they must be checked after project setup.
