# Implementation Plan: Pomelli Wrapper Web Frontend

## Summary of intended approach
- Extract the core run logic from `src/cli.ts` into `src/runner.ts` so both the CLI and the server share one implementation
- Build an Express HTTP server (`src/server.ts`) with REST endpoints and an SSE log-streaming endpoint; run it with `tsx` (no build step, consistent with the rest of the project)
- Scaffold a Vite + React + TypeScript frontend in `client/` with three pages: Home (submit URL), Results (live logs → results view), History (past runs)
- Use Tailwind CSS for styling; React Router for routing; native `EventSource` for SSE
- In dev mode, Vite proxies `/api/*` to Express on port 3001; in production Express serves `client/dist/` statically on port 3000

---

## Relevant code areas

### Modified
| File | Change |
|---|---|
| `src/cli.ts` | Slim down to call `runner.ts`; keep CLI parsing, session check, and `process.exit` |
| `package.json` | Add backend deps (`express`, `cors`) and frontend dev deps; add `server`, `client:dev`, `client:build` scripts |
| `tsconfig.json` | Verify `include` stays `src/**/*` only (client has its own tsconfig) |

### Created — backend
| File | Purpose |
|---|---|
| `src/runner.ts` | Core run logic extracted from `cli.ts`: accepts `brandUrl`, `sections`, `outBase`, `log` callback, returns manifest |
| `src/server.ts` | Express app: `POST /api/runs`, `GET /api/runs`, `GET /api/runs/:id`, `GET /api/runs/:id/stream`, `GET /api/runs/:id/file/*` |

### Created — frontend (`client/`)
| File | Purpose |
|---|---|
| `client/index.html` | Vite entrypoint |
| `client/vite.config.ts` | Proxy `/api` → `localhost:3001` in dev; output to `client/dist` |
| `client/tsconfig.json` | Frontend-only TypeScript config |
| `client/tailwind.config.ts` | Tailwind config scoped to `client/src/**` |
| `client/src/main.tsx` | React root, Router setup |
| `client/src/App.tsx` | Route definitions (`/`, `/run/:runId`, `/history`) |
| `client/src/pages/Home.tsx` | URL input form, submit handler, busy-state guard |
| `client/src/pages/Results.tsx` | SSE log stream → transition to results view on `done` event |
| `client/src/pages/History.tsx` | List past runs from `GET /api/runs` |
| `client/src/components/LogStream.tsx` | Scrolling terminal-style log display |
| `client/src/components/BrandOverviewCard.tsx` | Colors, fonts, tagline, brand values display |
| `client/src/components/AssetGallery.tsx` | Tabs/accordion per section; thumbnail grid |
| `client/src/components/LightboxModal.tsx` | Full-size image overlay on thumbnail click |
| `client/src/components/SectionBadge.tsx` | Section label → human-readable display name + count |

### Reference (not modified)
- `src/navigate/pomelli.ts` — imported by `runner.ts`
- `src/capture/capture-section.ts` — imported by `runner.ts`
- `src/capture/extract-overview.ts` — imported by `runner.ts`
- `outputs/` — read by server at `GET /api/runs` and `GET /api/runs/:id`

---

## Execution steps

### Phase 1 — Backend refactor and server

**1. Install backend dependencies**
```bash
npm install express cors
npm install --save-dev @types/express @types/cors
```

**2. Extract `src/runner.ts`**

Move the body of `main()` from `cli.ts` into an exported async function:
```typescript
export async function runWrap(opts: {
  brandUrl: string;
  sections: PlaSection[];
  outBase: string;
  headless: boolean;
  log: (msg: string) => void;
}): Promise<{ runId: string; runDir: string; status: string; manifest: object }>
```
- The function owns: `makeRunDir`, browser launch, all 6 steps, manifest write, browser close
- It returns the manifest object (not `process.exit`)
- `log` callback replaces direct `console.log` so the server can pipe lines to SSE

**3. Slim down `src/cli.ts`**
- Keep: `parseArgs()`, session file check, `console.log` summary, `process.exit`
- Replace the body of `main()` with a call to `runWrap({ ...args, log: console.log })`

**4. Create `src/server.ts`**

In-memory run state:
```typescript
interface ActiveRun {
  runId: string;
  status: "running" | "completed" | "failed";
  logs: string[];       // buffered for reconnecting SSE clients
  emitter: EventEmitter;
  manifest?: object;
}
let activeRun: ActiveRun | null = null;
```

Endpoints:
- `POST /api/runs` — validates `brandUrl`, checks session file, returns 409 if busy, fires `runWrap(...)` without `await` (detached), returns `{ runId }` immediately
  - Inside the detached promise: emit each log line as `emitter.emit("log", line)`, push to `activeRun.logs`, on completion emit `"done"`
- `GET /api/runs/:runId/stream` — SSE; replay `activeRun.logs` first, then subscribe to emitter; close on `done` or client disconnect
- `GET /api/runs/:runId` — returns `activeRun.manifest` (or reads `outputs/:runId/manifest.json` for past runs)
- `GET /api/runs` — `fs.readdirSync(outputsDir)` → filter `run-*` dirs → read each `manifest.json` → return array of `{ runId, brandUrl, brandName, startedAt, status, totalAssets }`
- `GET /api/runs/:runId/file/*` — serves any file inside `outputs/:runId/` (for assets and screenshots)
- Static serving: `express.static("client/dist")` with fallback to `index.html` (for React Router)

Express listens on `PORT` env var, defaulting to 3000 in production. In dev, Express listens on **3001** and Vite serves the frontend on **3000** with proxy.

**5. Add `package.json` scripts**
```json
"server":       "tsx src/server.ts",
"server:dev":   "tsx watch src/server.ts",
"client:dev":   "vite --config client/vite.config.ts",
"client:build": "vite build --config client/vite.config.ts",
"dev":          "concurrently \"npm run server:dev\" \"npm run client:dev\""
```
Install `concurrently` as a dev dependency.

**6. Type-check server code**
```bash
npx tsc --noEmit
```
Fix any issues. Verify `npm run wrap` still works.

---

### Phase 2 — Frontend scaffold

**7. Initialize Vite + React project in `client/`**
```bash
npm create vite@latest client -- --template react-ts
```
Then install Tailwind CSS inside `client/`:
```bash
cd client && npm install && npm install -D tailwindcss @tailwindcss/vite
```
Configure `client/vite.config.ts`:
- Add Tailwind plugin
- Add proxy: `{ "/api": { target: "http://localhost:3001", changeOrigin: true } }`
- Set `build.outDir: "../client/dist"` (relative to `client/`)

**8. Configure Tailwind**
In `client/src/index.css`:
```css
@import "tailwindcss";
```

**9. Create `client/src/App.tsx`**
React Router setup with routes: `/`, `/run/:runId`, `/history`.

---

### Phase 3 — Frontend pages and components

**10. `Home.tsx`**
- URL `<input>` + "Run" button
- On submit: `POST /api/runs` → on success navigate to `/run/:runId`; on 409 show inline "A run is already in progress" banner; on session error show "Session not found — run `npm run login` first"
- Validates URL format before submitting

**11. `Results.tsx`**
- On mount: open `EventSource` at `/api/runs/:runId/stream`
- Renders `<LogStream>` while `status === "running"`
- On SSE `done` event: fetch `GET /api/runs/:runId` → set manifest state → switch to results view
- Results view: `<BrandOverviewCard overview={manifest.overview} />` above `<AssetGallery sections={manifest.sections} runId={runId} />`

**12. `LogStream.tsx`**
- `<pre>` with monospace font, dark background, auto-scrolling
- Receives `lines: string[]` prop; renders each line
- Max visible height with overflow scroll

**13. `BrandOverviewCard.tsx`**
- Brand name + tagline as hero text
- Color swatches row (16x16 px circles with hex label below)
- Font list as badge chips
- Brand values as tag pills
- Website URL as clickable link

**14. `AssetGallery.tsx`**
- Tab bar: one tab per section that has `assetCount > 0`; tab label = human-readable section name + count badge
- Section display order: `dna-assets` → `brand-book` → `campaigns` → `photoshoot` → `dna-catalog`
- Human-readable names: `{ "dna-assets": "Brand Assets", "brand-book": "Brand Book", "dna-catalog": "Catalog", "campaigns": "Campaigns", "photoshoot": "Photoshoot" }`
- Each tab renders a responsive thumbnail grid (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`)

**15. Asset thumbnails**
- `<img src="/api/runs/:runId/file/sections/:section/assets/:file" />`
- Download link: `<a href="..." download>`
- Click → open `<LightboxModal>`

**16. `LightboxModal.tsx`**
- Fixed overlay, centered image, click outside to close, keyboard `Escape` to close
- Prev/next navigation if section has multiple assets

**17. `History.tsx`**
- On mount: `GET /api/runs` → renders table/list
- Columns: Brand name, URL, Date, Status (badge), Assets count, link to `/run/:runId`
- Empty state when no runs exist

---

### Phase 4 — Integration and production build

**18. Express static serving**

In `src/server.ts`, after API routes:
```typescript
const clientDist = path.resolve(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_, res) => res.sendFile(path.join(clientDist, "index.html")));
}
```

**19. Build and smoke test**
```bash
npm run client:build
npm run server
```
Open `localhost:3000`, submit a URL, verify full flow end-to-end.

**20. Final type-check**
```bash
npx tsc --noEmit
```

---

## Validation plan
- **Type-check**: `npx tsc --noEmit` must pass with zero errors after each phase
- **CLI regression**: `npm run wrap -- --url https://facebook.com --sections campaigns` must still work after `cli.ts` is slimmed down
- **Manual — full flow**:
  1. `npm run server` (with `client/dist` built) → `localhost:3000` shows Home page
  2. Submit `https://facebook.com` → redirects to `/run/:id` → logs stream in real-time
  3. Run completes → results view appears with brand overview card + asset tabs
  4. `dna-assets` tab shows ~36 thumbnails; each has download link; clicking opens lightbox
  5. `/history` shows the completed run
  6. Submit a second URL while a run is in progress → 409 "busy" shown in UI
  7. Delete `google-session.json`, submit URL → friendly session error shown in UI

---

## Assumptions
- `tsx` is used to run `src/server.ts` with no compile step — consistent with the project's existing pattern
- Express runs on port **3001** in dev (Vite on 3000 with proxy); on port **3000** in production (serves `client/dist/` statically)
- The detached async run inside `POST /api/runs` is safe because Node.js is single-threaded and Playwright is fully async — no shared mutable state issues beyond `activeRun`
- `client/` is a self-contained Vite project with its own `node_modules`, `package.json`, and `tsconfig.json`; it is not part of the root TypeScript compilation
- Past runs (not the active one) are served by reading `outputs/:runId/manifest.json` from disk
- Assets and screenshots are served via a single wildcard file-serving route rather than separate endpoints

---

## Risks
- **Browser inside server process**: Playwright launches Chromium in the same process as Express. If Playwright crashes, it takes the server down. Mitigation: log the error, set `activeRun.status = "failed"`, reset `activeRun = null` in a `finally` block so the server stays up.
- **SSE client reconnection**: If the browser tab reloads during a run, the SSE reconnects but `activeRun.logs` replays from the beginning — this is correct behavior. No risk.
- **`cli.ts` refactor introduces regression**: The runner logic is currently tightly coupled to `console.log`. If any log path is missed when switching to the `log` callback, CLI output disappears silently. Mitigation: run `npm run wrap` manually after the refactor and compare output to a known-good run.
- **Vite proxy in dev mode**: The proxy must forward SSE correctly. Vite's proxy does support SSE (`ws: false`, long-lived connections) but may require `changeOrigin: true` and setting appropriate headers. Test SSE in dev mode explicitly.
- **TypeScript `rootDir` conflict**: The root `tsconfig.json` has `rootDir: "src"`. `client/` has its own tsconfig and must not be included in the root compilation. Verify `include: ["src/**/*"]` excludes `client/`.
- **File serving path traversal**: The `GET /api/runs/:runId/file/*` wildcard must be sandboxed to the `outputs/` directory to prevent path traversal. Use `path.resolve` + `startsWith(outputsDir)` check.

---

## Escalation points
- Escalate if the Vite proxy does not correctly stream SSE events (EventSource drops connection immediately) — this may require switching to a WebSocket or polling approach
- Escalate if importing Playwright inside the server process causes startup-time errors (e.g., missing native binaries in the server context) — may need to switch to child process spawning
- Escalate if the root `tsconfig.json` cannot be kept compatible with a co-located `client/` Vite project without changes to existing compilation behavior

---

## PR reporting requirements
The PR must include:
- A summary of actual implementation
- A section called "Separation from implementation plan"
- Justification for each meaningful deviation
- Automated validation performed (`npx tsc --noEmit` output)
- Additional manual validation performed (which flows were tested, what was observed)
