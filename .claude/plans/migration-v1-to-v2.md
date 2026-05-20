# Implementation Plan: Pomelli Wrapper — Pivote a Playwright + Cloud (V3)

**Spec:** `.claude/specs/migration-v1-to-v2.md` v3.0  
**PRD:** `docs/prd.md` v3.0  
**Repo:** `https://github.com/Matias-Barengo-Copilot/pomelli-wrapper` (público)  
**Fecha:** 2026-05-20  
**Reemplaza:** plan `migration-v1-to-v2.md` basado en Computer Use — descartado

---

## Summary of intended approach

- Las fases son **secuenciales con dependencia dura**: no se empieza una sin que la anterior pase su smoke test
- **Fase 0 es el spike de validación**: un script de ~60 líneas que confirma que Playwright puede controlar Pomelli con sesión de Google activa. Todo lo demás depende de esto
- El CLI `npm run wrap -- --url <url>` **no cambia su interface** — solo cambia la implementación interna (Playwright en lugar de Computer Use + Docker)
- `src/capture/record-section.ts` conserva su firma pública; cambia la implementación para recibir `page: Page`
- `manifest.json` no cambia su formato — es el contrato de output
- La web app es thin: solo dispara el workflow y muestra estado
- **`google-session.json` nunca va al repo** — siempre encriptado en Supabase Storage

---

## Relevant code areas

### Archivos que se eliminan

| Archivo | Motivo |
|---|---|
| `src/agent/loop.ts` | Reemplazado por `src/browser/run.ts` |
| `src/agent/actions.ts` | xdotool/scrot → APIs nativas de Playwright |
| `src/agent/tools.ts` | Computer Use tools — ya no aplican |
| `src/agent/preflight.ts` | Lógica absorbida por `src/browser/navigation.ts` |
| `src/container/docker.ts` | Control via `docker exec` → Playwright nativo |
| `prompts/agent.md` | Prompt de Computer Use |
| `prompts/changelog.md` | Idem |
| `Dockerfile` | No se necesita para el browser |
| `docker-compose.yml` | Idem |
| `start.sh` | Idem |

### Archivos existentes que se modifican

| Archivo | Fase | Qué cambia |
|---|---|---|
| `src/capture/record-section.ts` | 1 | Recibe `page: Page`; usa `page.screenshot()`, `page.content()`, `page.evaluate()` en lugar de `docker exec scrot/CDP` |
| `src/cli.ts` | 1 | Llama `runBrowserLoop` en lugar de `runAgentLoop`; agrega comando `login`; soporta env vars `BRAND_URL`, `RUN_ID`, `SESSION_PATH` |
| `src/storage/local.ts` | 3 | Detectar `OUTPUTS_MODE=supabase`; llamar `supabase.uploadAsset` además de escritura local |
| `src/lib/types.ts` | 1 | Eliminar `SectionName` si ligada a Computer Use; preservar `RunManifest`, `SectionRecord`; agregar `needs_reauth` a `RunStatus` |
| `src/lib/constants.ts` | 1 | Eliminar `MODEL`, `COMPUTER_USE_BETA`; agregar `SESSION_PATH`, `OUTPUTS_MODE`, `ANALYSIS_TIMEOUT_MS` |
| `package.json` | 0 | Agregar `playwright` en devDependencies; agregar script `"login"`; agregar `@supabase/supabase-js` |
| `.gitignore` | 0 | Agregar `google-session.json` |
| `.env.example` | 1 | Reemplazar `ANTHROPIC_API_KEY` con `SESSION_PATH`, `SUPABASE_URL`, `SUPABASE_KEY`, `OUTPUTS_MODE` |

### Archivos nuevos

| Archivo | Fase | Descripción |
|---|---|---|
| `src/browser/session.ts` | 1 | `saveSession`, `createContext`, `isSessionValid` |
| `src/browser/navigation.ts` | 1 | `dismissOnboarding`, `enterBrandUrl`, `waitForAnalysis`, `navigateToSection`, `waitForSectionLoaded` |
| `src/browser/run.ts` | 1 | Loop principal con Playwright (reemplaza `src/agent/loop.ts`) |
| `src/cli/login.ts` | 0 | Abre Chromium visible, espera login manual, guarda `storageState` |
| `src/capture/asset-downloader.ts` | 1 | Descarga assets con cookies de sesión de Playwright |
| `src/storage/supabase.ts` | 3 | Cliente Supabase; `uploadAsset`, `updateRun` |
| `docs/selectors.md` | 0 | Selectores Playwright confirmados en el spike |
| `scripts/spike-playwright.ts` | 0 | Script temporal de validación (se elimina al cerrar Fase 0) |
| `scripts/encrypt-session.sh` | 2 | Encripta y sube `storageState` a Supabase Storage |
| `scripts/decrypt-session.sh` | 2 | Descarga y desencripta `storageState` |
| `.github/workflows/run-pomelli.yml` | 2 | Workflow de ejecución |
| `web/` | 4 | Next.js 15 App Router completa |

### Archivos que no cambian

- `src/lib/logger.ts`
- `src/storage/manifest.ts`
- Formato de `outputs/<run_id>/manifest.json`

---

## Execution steps

### Fase 0 — Spike de validación Playwright

> **Prerequisito de todo lo demás.** No avanzar a Fase 1 sin que el spike descargue 1 asset real de Pomelli.

**0.1 — Instalar Playwright**

```bash
npm install -D playwright
npx playwright install chromium
```

Verificar que Chromium headless corre sin errores:
```bash
npx playwright --version
```

Agregar en `package.json`:
```json
"scripts": {
  "login": "tsx src/cli/login.ts"
}
```

Agregar en `.gitignore`:
```
google-session.json
```

**0.2 — `src/cli/login.ts`**

```typescript
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

await page.goto("https://accounts.google.com");

console.log("Completá el login de Google en el browser. Presioná Enter cuando termines...");
await new Promise<void>((r) => process.stdin.once("data", r));

await context.storageState({ path: "google-session.json" });
await browser.close();
console.log("Sesión guardada en google-session.json");
```

Correr: `npm run login`. Completar el login de Google manualmente. Verificar que `google-session.json` se genera.

**0.3 — `scripts/spike-playwright.ts`**

Script temporal (~60 líneas) que valida el flujo completo:

```typescript
import { chromium } from "playwright";

const BRAND_URL = "https://facebook.com"; // hardcodeado para el spike

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: "google-session.json",
});
const page = await context.newPage();

// Navegar a Pomelli
await page.goto("https://labs.google.com/pomelli/");
await page.waitForLoadState("networkidle");

// Descartar onboarding popup si aparece
// (completar selectores cuando se vea la UI)
const popup = page.locator("dialog, [role='dialog']");
if (await popup.isVisible({ timeout: 3000 }).catch(() => false)) {
  // Buscar botón por texto
  await page.getByText(/let's go|get started|continue/i).click();
  await page.waitForTimeout(800);
}

// Verificar que llegamos a Pomelli (no a login de Google)
const url = page.url();
if (url.includes("accounts.google")) {
  console.error("SESIÓN INVÁLIDA — redirigió a Google login");
  process.exit(1);
}

// Ingresar brand URL
// (completar con selector real del input)
await page.locator("input").first().fill(BRAND_URL);
await page.keyboard.press("Enter");

// Esperar análisis
await page.waitForSelector("/* selector de sección cargada */", { timeout: 120_000 });

// Screenshot
import { mkdirSync } from "fs";
mkdirSync("outputs/spike", { recursive: true });
await page.screenshot({ path: "outputs/spike/after-analysis.png", fullPage: true });

// Extraer 1 URL de imagen
const imgUrl: string = await page.evaluate(() => {
  const img = document.querySelector("img[src^='http']") as HTMLImageElement;
  return img?.src ?? "";
});

if (imgUrl) {
  const res = await fetch(imgUrl);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync("outputs/spike/asset-001.png", buf);
  console.log("Asset descargado:", imgUrl);
} else {
  console.warn("No se encontró ninguna imagen");
}

await browser.close();
console.log("Spike completado. Ver outputs/spike/");
```

> **Los selectores son incompletos en este draft** — se completan al ver la UI real durante el spike. Eso es el trabajo de la Fase 0.

**0.4 — Ejecutar el spike e identificar selectores**

1. Correr `npx tsx scripts/spike-playwright.ts`
2. Inspeccionar `outputs/spike/after-analysis.png`
3. Para cada selector faltante (popup, URL input, sección cargada):
   - Agregar `{ headless: false }` temporalmente al launch
   - Usar `page.pause()` para abrir el Playwright Inspector
   - Identificar el selector correcto con `page.locator(...).highlight()`
4. Reemplazar los placeholders del spike hasta que corra end-to-end

**0.5 — `docs/selectors.md`**

Crear con los selectores confirmados:

```markdown
# Selectores Playwright confirmados — Pomelli

**Fecha de validación:** 2026-05-XX

## Onboarding popup
- Contenedor: `dialog` / `[role='dialog']`
- Botón de dismiss: `<completar>`

## URL input
- Selector: `<completar>`

## Indicador de análisis en progreso
- Selector: `<completar>`

## Secciones (sidebar)
- Business DNA: `<completar>`
- Campaigns: `<completar>`
- Photoshoot: `<completar>` (puede no existir)
- Animate: `<completar>` (puede no existir)

## Sección cargada (sin spinners)
- Spinner: `<completar>`
- Business DNA lista: `<completar>`
- Campaigns lista: `<completar>`

## Assets por sección
- Business DNA: `<completar>`
- Campaigns: `<completar>`
```

**Smoke test Fase 0:** `outputs/spike/asset-001.png` existe, es una imagen válida, y `outputs/spike/after-analysis.png` muestra contenido de Pomelli (no pantalla de login ni error).

---

### Fase 1 — CLI completo con Playwright

**1.1 — `src/browser/session.ts`**

```typescript
import { chromium, type Browser, type BrowserContext } from "playwright";

export async function saveSession(outputPath: string, page: import("playwright").Page): Promise<void> {
  await page.context().storageState({ path: outputPath });
}

export async function createContext(browser: Browser, sessionPath: string): Promise<BrowserContext> {
  return browser.newContext({ storageState: sessionPath });
}

export async function isSessionValid(page: import("playwright").Page): Promise<boolean> {
  return !page.url().includes("accounts.google");
}
```

**1.2 — `src/browser/navigation.ts`**

Implementar con los selectores de `docs/selectors.md`:

```typescript
import type { Page } from "playwright";
import type { SectionName } from "../lib/types.js";
import { logger } from "../lib/logger.js";
import { ANALYSIS_TIMEOUT_MS } from "../lib/constants.js";

const STEP = "navigation";

export async function dismissOnboarding(page: Page): Promise<boolean> {
  // Usar selectores de docs/selectors.md
  // Retorna true si se encontró y dismissó el popup
}

export async function enterBrandUrl(page: Page, brandUrl: string): Promise<void> {
  // Usar selector del input de docs/selectors.md
  // click → fill → Enter
}

export async function waitForAnalysis(page: Page, timeoutMs = ANALYSIS_TIMEOUT_MS): Promise<void> {
  // waitForSelector del indicador de sección cargada
  // Si supera timeoutMs → throw new Error("analysis_timeout")
}

export async function navigateToSection(page: Page, section: SectionName): Promise<void> {
  // Click en el ícono de sidebar según la sección
}

export async function waitForSectionLoaded(page: Page, section: SectionName, timeoutMs = 120_000): Promise<void> {
  // Esperar ausencia de spinner + presencia de contenido
  // Si supera timeoutMs → throw new Error("section_timeout")
}
```

**1.3 — `src/capture/asset-downloader.ts`**

```typescript
import { writeFileSync, mkdirSync } from "fs";
import { join, extname } from "path";
import { createHash } from "crypto";
import type { Cookie } from "playwright";

export interface AssetRecord {
  filename: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
}

export async function downloadAll(
  urls: string[],
  cookies: Cookie[],
  outputDir: string
): Promise<AssetRecord[]> {
  mkdirSync(outputDir, { recursive: true });
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  const results: AssetRecord[] = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const res = await fetch(url, { headers: { Cookie: cookieHeader } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const mime = res.headers.get("content-type") ?? "application/octet-stream";
      const ext = extname(new URL(url).pathname) || mimeToExt(mime);
      const filename = `${String(i + 1).padStart(3, "0")}${ext}`;
      writeFileSync(join(outputDir, filename), buf);
      results.push({
        filename,
        url,
        mime_type: mime,
        size_bytes: buf.length,
        sha256: createHash("sha256").update(buf).digest("hex"),
      });
    } catch (e) {
      // Log y continuar — un fallo no aborta el batch
      logger.warn("asset-downloader", "failed to download", { url, error: String(e) });
    }
  }

  return results;
}

function mimeToExt(mime: string): string {
  if (mime.includes("jpeg")) return ".jpg";
  if (mime.includes("png")) return ".png";
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("gif")) return ".gif";
  if (mime.includes("mp4")) return ".mp4";
  if (mime.includes("webm")) return ".webm";
  return ".bin";
}
```

**1.4 — Reescribir `src/capture/record-section.ts`**

```typescript
import type { Page } from "playwright";
// ... imports existentes ...

export async function recordSection(
  runId: string,
  sectionName: SectionName,
  page: Page            // nuevo parámetro
): Promise<SectionRecord> {
  const sectionDir = join(buildRunDir(runId), "sections", sectionName);
  mkdirSync(sectionDir, { recursive: true });

  // Screenshot
  const screenshotPath = join(sectionDir, "screenshot.png");
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // DOM dump
  const html = await page.content();
  writeFileSync(join(sectionDir, "dom.html"), html, "utf-8");

  // Extraer URLs de assets usando selectores de docs/selectors.md
  const assetUrls: string[] = await page.evaluate(() => {
    // Completar con lógica real según la sección
    return Array.from(document.querySelectorAll("img[src^='http']"))
      .map((el) => (el as HTMLImageElement).src)
      .filter(Boolean);
  });

  // Descargar assets
  const cookies = await page.context().cookies();
  const assets = await downloadAll(assetUrls, cookies, join(sectionDir, "assets"));

  return {
    name: sectionName,
    screenshot: screenshotPath,
    dom: join(sectionDir, "dom.html"),
    assets,
    recorded_at: new Date().toISOString(),
  };
}
```

**1.5 — `src/browser/run.ts`**

```typescript
import { chromium } from "playwright";
import { navigateToSection, waitForSectionLoaded, /* ... */ } from "./navigation.js";
import { createContext, isSessionValid } from "./session.js";
import { recordSection } from "../capture/record-section.js";
import { AgentErrorSignal, AgentDoneSignal } from "../lib/types.js";

const POMELLI_URL = "https://labs.google.com/pomelli/";
const SECTIONS: SectionName[] = ["business_dna", "campaign", "photoshoot", "animate"];

export async function runBrowserLoop(
  runId: string,
  brandUrl: string,
  manifest: RunManifest
): Promise<LoopResult> {
  const sessionPath = process.env.SESSION_PATH ?? "google-session.json";
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await createContext(browser, sessionPath);
    const page = await context.newPage();

    await page.goto(POMELLI_URL, { waitUntil: "networkidle" });

    if (!await isSessionValid(page)) {
      throw new AgentErrorSignal("session_expired", "Redirected to Google login — storageState expired");
    }

    await dismissOnboarding(page);
    await enterBrandUrl(page, brandUrl);
    await waitForAnalysis(page);

    const sections: RunManifest["sections"] = [];

    for (const section of SECTIONS) {
      try {
        await navigateToSection(page, section);
        await waitForSectionLoaded(page, section);
        const record = await recordSection(runId, section, page);
        sections.push(record);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg === "section_timeout") {
          logger.warn("run", `section ${section} timed out — skipping`);
        } else {
          logger.warn("run", `section ${section} not available — skipping`, { error: msg });
        }
      }
    }

    await page.screenshot({ path: join(buildRunDir(runId), "final.png") });

    return { sections, iterations: 0, usage: { input: 0, output: 0 }, finalScreenshotPath: null };

  } finally {
    await browser.close();
  }
}
```

**1.6 — Adaptar `src/cli.ts`**

```typescript
// Reemplazar llamada a runAgentLoop:
import { runBrowserLoop } from "./browser/run.js";
// ...
const result = await runBrowserLoop(runId, brandUrl, manifest);

// Agregar comando login:
if (args[0] === "login") {
  await import("./cli/login.js");
  process.exit(0);
}

// Env vars:
const brandUrl = process.env.BRAND_URL ?? args.brandUrl;
const runId = process.env.RUN_ID ?? generateRunId();
```

**1.7 — Eliminar archivos obsoletos**

```bash
rm src/agent/loop.ts src/agent/actions.ts src/agent/tools.ts src/agent/preflight.ts
rm src/container/docker.ts
rm -rf prompts/
rm Dockerfile docker-compose.yml start.sh
```

**1.8 — Type-check**

```bash
npx tsc --noEmit
```

**Smoke test Fase 1:** `npm run wrap -- --url <url-real>` genera `outputs/<run_id>/manifest.json` con `status: completed`, screenshots y assets de al menos Business DNA y Campaigns. Repetir con 3 URLs, tasa de éxito ≥80%.

---

### Fase 2 — GitHub Actions workflow

**2.1 — `scripts/encrypt-session.sh`**

```bash
#!/bin/bash
# Uso: bash scripts/encrypt-session.sh
# Requiere: SUPABASE_URL, SUPABASE_KEY, SESSION_ENCRYPTION_KEY en el entorno

INPUT="google-session.json"
ENCRYPTED="google-session.json.enc"

openssl enc -aes-256-cbc -pbkdf2 \
  -in "$INPUT" \
  -out "$ENCRYPTED" \
  -k "$SESSION_ENCRYPTION_KEY"

# Subir a Supabase Storage (requiere @supabase/supabase-js)
node -e "
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const buf = readFileSync('$ENCRYPTED');
const { error } = await s.storage.from('sessions').upload('active.json.enc', buf, { upsert: true });
if (error) { console.error(error); process.exit(1); }
console.log('Session uploaded to Supabase Storage');
" --input-type=module

rm "$ENCRYPTED"
```

**2.2 — `scripts/decrypt-session.sh`**

```bash
#!/bin/bash
# Uso: bash scripts/decrypt-session.sh
# Descarga y desencripta google-session.json desde Supabase Storage

node -e "
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const { data, error } = await s.storage.from('sessions').download('active.json.enc');
if (error) { console.error(error); process.exit(1); }
writeFileSync('google-session.json.enc', Buffer.from(await data.arrayBuffer()));
" --input-type=module

openssl enc -d -aes-256-cbc -pbkdf2 \
  -in google-session.json.enc \
  -out google-session.json \
  -k "$SESSION_ENCRYPTION_KEY"

rm google-session.json.enc
echo "Session decrypted to google-session.json"
```

**2.3 — `.github/workflows/run-pomelli.yml`**

```yaml
name: Run Pomelli
on:
  workflow_dispatch:
    inputs:
      brand_url:
        required: true
        type: string
      run_id:
        required: true
        type: string

jobs:
  run:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - run: npm ci

      - name: Install Playwright Chromium
        run: npx playwright install chromium --with-deps

      - name: Download and decrypt session
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_SECRET_KEY }}
          SESSION_ENCRYPTION_KEY: ${{ secrets.SESSION_ENCRYPTION_KEY }}
        run: bash scripts/decrypt-session.sh

      - name: Run wrapper
        env:
          BRAND_URL: ${{ inputs.brand_url }}
          RUN_ID: ${{ inputs.run_id }}
          SESSION_PATH: ./google-session.json
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_SECRET_KEY }}
          OUTPUTS_MODE: supabase
        run: npm run wrap

      - name: Re-encrypt and upload session if changed
        if: always()
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_SECRET_KEY }}
          SESSION_ENCRYPTION_KEY: ${{ secrets.SESSION_ENCRYPTION_KEY }}
        run: |
          if [ -f google-session.json ]; then
            bash scripts/encrypt-session.sh
          fi

      - name: Secure cleanup
        if: always()
        run: rm -f google-session.json google-session.json.enc
```

**Smoke test Fase 2:** Disparar workflow manualmente desde GitHub → Actions UI. Verificar assets en Supabase Storage bajo `runs/<run_id>/` y fila en tabla `runs` con `status: completed`.

---

### Fase 3 — Supabase backend

**3.1 — SQL migration** (correr en Supabase → SQL Editor)

```sql
create table if not exists runs (
  id              text primary key,
  brand_url       text not null,
  status          text not null default 'queued',
  -- queued | running | completed | failed | needs_reauth
  started_at      timestamptz,
  finished_at     timestamptz,
  manifest        jsonb,
  error_type      text,
  error_message   text,
  actions_run_id  text,
  created_at      timestamptz default now()
);
```

**3.2 — Crear buckets**
- `runs` → privado
- `sessions` → privado

**3.3 — `src/storage/supabase.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";
import type { RunManifest } from "../lib/types.js";

function client() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
}

export function isSupabaseMode(): boolean {
  return process.env.OUTPUTS_MODE === "supabase" &&
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_KEY;
}

export async function updateRun(runId: string, fields: Record<string, unknown>): Promise<void> {
  const { error } = await client().from("runs").update(fields).eq("id", runId);
  if (error) throw new Error(`updateRun failed: ${error.message}`);
}

export async function uploadAsset(
  runId: string,
  relativePath: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  const path = `runs/${runId}/${relativePath}`;
  const { error } = await client()
    .storage.from("runs")
    .upload(path, buffer, { contentType, upsert: true });
  if (error) throw new Error(`uploadAsset failed: ${error.message}`);
}
```

**3.4 — Modificar `src/storage/local.ts`**

Agregar al final de cada función de escritura:
```typescript
if (isSupabaseMode()) {
  await uploadAsset(runId, relativePath, buffer, contentType).catch(
    (e) => logger.warn("local", "supabase upload failed", { error: e.message })
  );
}
```

**3.5 — Modificar `src/cli.ts`**

```typescript
// Al inicio:
if (isSupabaseMode()) {
  await updateRun(runId, { status: "running", started_at: new Date().toISOString() });
}

// Al finalizar (success):
if (isSupabaseMode()) {
  await updateRun(runId, { status: "completed", finished_at: new Date().toISOString(), manifest });
}

// Al finalizar (error):
if (isSupabaseMode()) {
  await updateRun(runId, {
    status: errorType === "session_expired" ? "needs_reauth" : "failed",
    finished_at: new Date().toISOString(),
    error_type: errorType,
    error_message: errorMessage,
  });
}
```

**Smoke test Fase 3:** Correr localmente con `OUTPUTS_MODE=supabase SUPABASE_URL=... SUPABASE_KEY=... npm run wrap -- --url <url>`. Verificar fila en tabla `runs` y assets en bucket `runs` en el dashboard de Supabase.

---

### Fase 4 — Web App Next.js

**4.1 — Scaffold**

```bash
mkdir web && cd web
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
npm install @supabase/supabase-js
```

**4.2 — `web/lib/supabase.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";

// Cliente browser (anon key — solo lectura de runs)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// Cliente server (service_role — escritura)
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}
```

**4.3 — `web/lib/github.ts`**

```typescript
export async function dispatchWorkflow(brandUrl: string, runId: string): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}/actions/workflows/run-pomelli.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        ref: "main",
        inputs: { brand_url: brandUrl, run_id: runId },
      }),
    }
  );
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  return runId;
}
```

**4.4 — Rutas en orden**

1. `web/app/page.tsx` → redirect a `/runs`
2. `web/app/runs/page.tsx` → `supabase.from("runs").select().order("created_at", { ascending: false })` → tabla
3. `web/app/runs/new/page.tsx` → form con `<input type="url">`, submit → `POST /api/runs`
4. `web/app/api/runs/route.ts`:
   ```typescript
   // POST
   const { brand_url } = await req.json();
   // 1. Verificar no hay run activo
   const { data: active } = await supabaseAdmin().from("runs")
     .select("id").eq("status", "running").limit(1);
   if (active?.length) return NextResponse.json({ error: "Hay un run activo" }, { status: 409 });
   // 2. Crear run
   const runId = generateRunId();
   await supabaseAdmin().from("runs").insert({ id: runId, brand_url, status: "queued" });
   // 3. Dispatch workflow
   await dispatchWorkflow(brand_url, runId);
   return NextResponse.json({ run_id: runId }, { status: 201 });
   ```
5. `web/app/runs/[id]/page.tsx` → polling cada 5s a `/api/runs/[id]`; thumbnails de assets; banner `needs_reauth`
6. `web/app/api/runs/[id]/route.ts` → GET fila de Supabase
7. `web/app/api/runs/[id]/asset/route.ts` → signed URL con 1h de expiración

**4.5 — Deploy en Vercel**

Importar repo → root directory `web/` → env vars → Deploy.

Env vars requeridas en Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `GITHUB_TOKEN` (PAT con `actions:write`)
- `GITHUB_REPO_OWNER=Matias-Barengo-Copilot`
- `GITHUB_REPO_NAME=pomelli-wrapper`

**Smoke test Fase 4:** Abrir URL de Vercel → `/runs/new` → crear run → ver aparecer en GitHub Actions → esperar → ver assets en `/runs/[id]` → descargar 1 asset.

---

### Fase 5 — Hardening

**5.1 — Purge automático**

Supabase Edge Function `purge-old-runs` con schedule `0 3 * * *`:
```typescript
const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
const { data: old } = await supabase.from("runs").select("id").lt("finished_at", cutoff);
for (const run of old ?? []) {
  await supabase.storage.from("runs").remove([`runs/${run.id}`]);
  await supabase.from("runs").update({ manifest: null }).eq("id", run.id);
}
```

**5.2 — `README.md`**

Secciones:
- Setup para engineer nuevo (install Node, Playwright, `npm run login`)
- Uso diario (`npm run wrap -- --url <url>`)
- Re-login cuando expira la sesión (detectar `needs_reauth` en la web app → `npm run login` → `bash scripts/encrypt-session.sh`)
- Troubleshooting (selectores rotos, sesión expirada, Chromium bloqueado por Google)

**5.3 — Demo final**

3 URLs reales. Documentar en `docs/demo-results.md`:
- Tasa de éxito observada
- Tiempo promedio por run
- Secciones disponibles por URL

---

## Validation plan

**Type-check en cada fase:**
```bash
npx tsc --noEmit          # raíz del repo
cd web && npx tsc --noEmit  # solo desde Fase 4
```

**Smoke tests por fase:**

| Fase | Comando | Criterio |
|---|---|---|
| 0 | `npx tsx scripts/spike-playwright.ts` | `outputs/spike/asset-001.png` existe y es imagen válida |
| 1 | `npm run wrap -- --url <url>` × 3 URLs | ≥80% con `status: completed`; <15 min cada una |
| 2 | Workflow disparado desde GitHub Actions UI | Assets en Supabase Storage; `status: completed` en DB |
| 3 | `OUTPUTS_MODE=supabase npm run wrap -- --url <url>` | Fila y assets en Supabase |
| 4 | Flujo completo desde Vercel | Run creado → progreso visible → asset descargable |
| 5 | 2 runs simultáneos desde la web app | Segundo recibe 409; purge elimina runs >30 días |

**Regresión:** después de cada smoke test, correr el de la fase anterior para confirmar que no se rompió nada.

---

## Assumptions

- `google-session.json` generado por `npm run login` es suficiente para que Playwright autentique en Pomelli sin volver a pedir credenciales. Si Google invalida el `storageState` frecuentemente (<1 semana), evaluar agregar re-login automático detectando la redirección
- Chromium (no Firefox) es suficiente para cargar Pomelli. Si Pomelli detecta Chromium como bot, agregar `playwright-extra` + `puppeteer-extra-plugin-stealth` como siguiente paso
- Los assets de Pomelli requieren las cookies de la sesión para descargarse. Si resultan ser URLs públicas, eliminar el header `Cookie` de `asset-downloader.ts`
- `npx playwright install chromium --with-deps` funciona en ubuntu-latest sin permisos de root adicionales (es el comportamiento estándar de los runners de GitHub Actions)
- GitHub Actions en repo público da minutos ilimitados — suficiente para todos los runs previstos
- Supabase free tier 1GB de Storage es suficiente con el purge automático de Fase 5 (≈10 runs máx sin purge a ~100MB/run)
- La cuenta Google de automation no tiene 2FA que requiera intervención en cada run

---

## Risks

| Riesgo | Fase | Mitigación |
|---|---|---|
| Google detecta Playwright como bot y bloquea la sesión | 0 | Probar headless vs. `headless: false` para el spike. Si falla en headless: agregar `playwright-extra` + stealth. Si sigue fallando: evaluar Browserbase |
| Selectores de Pomelli cambian tras actualización de la UI | 1+ | `docs/selectors.md` documenta selectores con fecha de validación. Usar `page.getByText()` y `page.getByRole()` donde sea posible — más resilientes que CSS selectors. Agregar alerta en Supabase cuando `status: failed` con error de selector |
| `storageState` expira en medio de un run en Actions | 2 | `isSessionValid(page)` detecta el redirect → `AgentErrorSignal("session_expired")` → run termina con `needs_reauth`. No hay loop infinito |
| Pomelli cambia el flujo de onboarding y el script se queda colgado | 1 | `waitForAnalysis` y `waitForSectionLoaded` tienen timeout explícito. Si hay timeout → sección se skipea con warning, no aborta el run |
| GitHub PAT en Vercel expira y el workflow dispatch falla | 4 | Usar GitHub App token (no expira) si el PAT da problemas. Documentar en README |
| Supabase Storage 1GB se llena | 5 | Purge automático de Fase 5 lo previene. Monitorear en Supabase dashboard |

---

## Escalation points

- **Escalar si** Chromium es detectado como bot en Fase 0 incluso con `playwright-extra` stealth — evaluar Browserbase antes de seguir con Fase 1
- **Escalar si** los selectores de Pomelli son tan dinámicos que se rompen en cada run — evaluar heurísticas basadas en `page.getByText()` / `page.getByRole()` en lugar de CSS selectors
- **Escalar si** un run en Fase 1 supera 15 min consistentemente — identificar qué sección está tardando y agregar timeout más agresivo o skipeo
- **Escalar si** la tasa de éxito en la demo de Fase 5 es menor al 60% — investigar causa raíz antes de continuar

---

## PR reporting requirements

Cada PR debe incluir:
- **Summary:** qué fase(s) cubre, archivos modificados, resultado del smoke test
- **Type-check:** output de `npx tsc --noEmit` (debe ser limpio)
- **Smoke test:** screenshot o log que evidencia el criterio de la fase
- **Selectores actualizados:** si la fase incluyó descubrimiento de nuevos selectores, linkear el commit de `docs/selectors.md`
- **Desviaciones:** cualquier paso ejecutado diferente al plan y por qué
