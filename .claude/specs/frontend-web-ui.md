# Task Spec: Pomelli Wrapper Web Frontend

## Objective
The CLI works end-to-end and captures brand assets from Pomelli. Currently the only way to
use it is via the terminal. We need a local web UI so non-technical users can submit a
brand URL, watch the run progress live, and view the captured results (Business DNA overview
+ all assets grouped by source section) in a visually clear, shareable layout.

## Scope
- **Backend HTTP server** (`src/server.ts`): Express, runs via `npm run server`
  - `POST /api/runs` — starts a Pomelli run (accepts `{ brandUrl, sections? }`), returns `{ runId }`
  - `GET /api/runs/:runId/stream` — SSE endpoint that streams run log lines in real-time
  - `GET /api/runs/:runId` — returns the full `manifest.json` once the run is complete
  - `GET /api/runs/:runId/assets/:section/:file` — serves individual asset files from disk
  - `GET /api/runs` — lists previous runs (reads `outputs/` directory, returns run metadata)
- **React frontend** (`client/` directory), built with Vite, served statically by Express
  - **Run page (`/`)**: URL input field + "Run" button → triggers `POST /api/runs` → redirects to results page
  - **Results page (`/run/:runId`)**: streams live logs during run; on completion transitions to results view
    - Brand overview card: name, website, tagline, colors (swatches), fonts, brand values, keywords
    - Asset gallery: one section per tab/accordion — `dna-assets`, `brand-book`, `campaigns`, `photoshoot`, `dna-catalog` — each showing image thumbnails with section label + count badge
    - Download button per asset; "Download all" zip (or per-section zip) as stretch goal
  - **History page (`/history`)**: list of past runs with brand name, date, asset count, link to results
- **One run at a time** (V1): if a run is already in progress, the server returns 409 and the UI shows a "busy" state
- **No new Google auth flow**: the server requires `google-session.json` to exist (same as CLI); shows clear error if missing

## Out of scope
- Multi-user auth / user accounts
- Cloud deployment — local only
- Database — results are read from the existing `outputs/` filesystem layout
- Changing any existing CLI, navigation, or capture logic
- "Website" section (remains excluded, as per existing CLI behavior)
- Campaigns / Photoshoot interactive generation (these sections are UIs that require user clicks inside Pomelli — not automatable in V1)
- ZIP download of all assets (stretch goal, not required for acceptance)
- Dark mode

## Context / affected areas
- `src/cli.ts` — existing entry point; server will import the same core functions (not re-run CLI as subprocess)
- `src/navigate/pomelli.ts` — navigation primitives; server imports directly
- `src/capture/capture-section.ts` — asset capture; server imports directly
- `src/capture/extract-overview.ts` — overview extraction; server imports directly
- `outputs/` — existing run output directory; server reads manifests + serves asset files from here
- `google-session.json` — must exist before server starts
- `package.json` — new deps: `express`, `@types/express`, React/Vite stack for client
- New files: `src/server.ts`, `client/` (Vite + React project)

## Constraints
- Do not modify any existing `src/navigate/` or `src/capture/` logic
- Preserve the existing `npm run wrap` CLI — it must continue to work after this change
- The server must reuse the same core library functions (not spawn a child process)
- One run at a time: no concurrency, no job queue
- Keep the `google-session.json` requirement as-is — the server must not automate Google login
- Frontend stack: React + Vite (TypeScript). No Next.js, no SSR complexity.
- No external CSS framework required — but the result must look polished (Tailwind CSS is acceptable)
- `outputs/` directory structure must not change (manifest.json schema stays at v2.0)

## Acceptance criteria
- [ ] `npm run server` starts the Express server on port 3000 (configurable via `PORT` env var)
- [ ] Visiting `localhost:3000` shows the run submission form
- [ ] Submitting a valid brand URL triggers a Pomelli run; the results page shows streaming log output in real-time during the run
- [ ] After the run completes, the results page shows the brand overview card (name, tagline, colors as colored swatches, fonts)
- [ ] Asset gallery renders all captured images grouped by section tab/accordion; section headers show the section name and asset count
- [ ] Each asset is displayed as a thumbnail; clicking it shows the full-size image
- [ ] Individual assets have a download link
- [ ] If `google-session.json` does not exist, `POST /api/runs` returns a clear error and the UI displays a human-readable message ("Session not found — run `npm run login` first")
- [ ] If a run is already in progress, starting a second run shows a "busy" error in the UI
- [ ] The history page lists all runs from `outputs/` with brand name, date, status, and asset count; each links to its results page
- [ ] `npm run wrap` (CLI) still works unchanged after all changes
- [ ] `npx tsc --noEmit` passes with no errors

## Testing requirements
- Automated: none required for V1 (no test suite exists in the project)
- Manual:
  - Start server, navigate to `localhost:3000`
  - Submit `https://facebook.com` → confirm logs stream → confirm results page renders with assets in `dna-assets` tab and `brand-book`
  - Navigate to `/history` → confirm the run appears
  - Stop server, run `npm run wrap -- --url https://facebook.com --sections campaigns` → confirm CLI still works
  - Remove `google-session.json`, submit URL → confirm friendly error shown in UI

## Out-of-scope protocol
- Minor necessary deviations may proceed if documented.
- Material deviations (e.g., adding a database, changing manifest schema, replacing Vite with another bundler) require escalation before proceeding.

## Open questions / assumptions
- **Assumption**: The server imports core library functions directly (same process) rather than spawning `tsx src/cli.ts` as a child process. This simplifies SSE streaming but means the Playwright browser runs inside the server process.
- **Assumption**: Vite dev server proxies `/api/*` to Express during development; in production the Express server serves the Vite build from `client/dist/`.
- **Open**: Should the run page auto-redirect to results once the run ID is known, or stay on the same page and transition inline? (Assume redirect for simplicity.)
- **Open**: Should the history page be a separate route or a collapsible panel on the main page? (Assume separate `/history` route.)
- **Open**: Is Tailwind CSS acceptable, or is there a preferred styling approach? (Assume Tailwind is fine.)
- **Assumption**: Port 3000 by default; configurable via `PORT` env var.
- **Assumption**: "One run at a time" — a global `isRunning` flag on the server is sufficient for V1 (single user, local).
