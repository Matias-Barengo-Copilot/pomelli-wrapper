# Task Spec: Pomelli Wrapper — Pivote a Playwright + Cloud (V3)

**Referencia PRD:** `docs/prd.md` v3.0  
**Repo:** `https://github.com/Matias-Barengo-Copilot/pomelli-wrapper` (público — GitHub Actions ilimitadas)  
**Fecha:** 2026-05-20  
**Reemplaza:** spec `migration-v1-to-v2.md` v2.0 (basado en Computer Use — descartado)

---

## Objective

Reemplazar el enfoque de Claude Computer Use con **Playwright + Chromium headless** para automatizar Pomelli de forma determinística, sin costo por run, y con mayor confiabilidad.

El flujo completo es:

1. **Sesión de Google** — un engineer logea Google manualmente una vez con `npm run login`; Playwright guarda `storageState` (cookies + localStorage) en un JSON encriptado
2. **Automatización** — `npm run wrap -- --url <brand-url>` restaura el `storageState`, navega Pomelli, captura cada sección, descarga assets
3. **Cloud** — un job de GitHub Actions ejecuta el mismo CLI sin Docker, subiendo outputs a Supabase en tiempo real
4. **Web app** — Next.js en Vercel para que todo el equipo dispare runs y descargue assets

**Lo que se elimina completamente:**
- Claude Computer Use y toda la infraestructura asociada (`src/agent/`, `src/container/docker.ts`)
- Docker para control del browser (Firefox + Xvfb + VNC + xdotool + scrot)
- Firefox profile tar.gz — reemplazado por `storageState` JSON (~50KB vs ~200MB)

**Lo que se preserva:**
- Formato de `manifest.json` — es el contrato de output, no cambia
- `src/storage/local.ts` — estructura de outputs en disco
- `src/capture/record-section.ts` — interface, no la implementación
- `src/lib/types.ts`, `src/lib/logger.ts`, `src/lib/constants.ts`

---

## Scope

### Fase 0 — Spike de validación Playwright *(estado actual — prerequisito de todo lo demás)*

Validar que Playwright puede controlar Pomelli con sesión de Google activa antes de refactorizar el CLI completo.

**0.1 — Setup Playwright**
- Instalar: `npm install -D playwright` + `npx playwright install chromium`
- Verificar que Chromium headless corre en Windows (Git Bash) sin errores
- Agregar `playwright` a `devDependencies` en `package.json`

**0.2 — Login manual y exportación de `storageState`**
- Crear `src/cli/login.ts`: abre Chromium visible (`headless: false`), navega a `https://accounts.google.com`, espera a que el usuario complete el login manualmente, guarda `storageState` en `google-session.json`
- Agregar a `package.json` scripts: `"login": "tsx src/cli/login.ts"`
- `google-session.json` en `.gitignore` — nunca al repo

**0.3 — Script de spike de navegación**
- Crear `scripts/spike-playwright.ts`: archivo temporal (no va al CLI final)
- Restaura `storageState` desde `google-session.json`
- Navega a `https://labs.google.com/pomelli/`
- Detecta y descarta el popup de onboarding
- Ingresa una URL de marca hardcodeada
- Espera a que aparezca la sección Business DNA
- Toma un screenshot y lo guarda en `outputs/spike/`
- **Criterio:** el screenshot muestra contenido de Pomelli, no una pantalla de error ni de login

**0.4 — Extracción de 1 asset**
- Extender el spike: una vez en Business DNA, usar `page.evaluate()` para extraer todas las URLs de imágenes visibles
- Descargar la primera URL encontrada como `outputs/spike/asset-001.png`
- **Criterio:** el archivo existe y es una imagen válida (no una imagen de error ni placeholder)

**0.5 — Documentar selectores confirmados**
- Crear `docs/selectors.md` con los selectores Playwright que funcionaron para:
  - Onboarding popup (dismissal)
  - URL input de Pomelli
  - Indicador de análisis en progreso
  - Indicador de sección cargada (Business DNA, Campaigns, Photoshoot, Animate)
  - Asset URLs por sección

**Criterio de salida de Fase 0:** un script de ~60 líneas que navega Pomelli end-to-end y descarga 1 asset real. Los selectores están documentados en `docs/selectors.md`.

---

### Fase 1 — CLI completo con Playwright

Reemplazar `src/agent/` y `src/container/` con módulos Playwright. El entry point `npm run wrap -- --url <url>` sigue siendo el mismo.

**1.1 — `src/browser/session.ts`**
- `saveSession(outputPath: string): Promise<void>` — guarda `context.storageState()` en un archivo JSON
- `createContext(browser: Browser, sessionPath: string): Promise<BrowserContext>` — crea contexto restaurando `storageState` desde el JSON
- `isSessionValid(page: Page): Promise<boolean>` — detecta si la página actual es un redirect a Google login (`page.url().includes("accounts.google")`)

**1.2 — `src/browser/navigation.ts`**
- `dismissOnboarding(page: Page): Promise<boolean>` — busca y clickea el popup de onboarding usando los selectores de `docs/selectors.md`; retorna `true` si lo encontró, `false` si no había popup
- `enterBrandUrl(page: Page, brandUrl: string): Promise<void>` — clickea el input, tipea la URL, presiona Enter
- `waitForAnalysis(page: Page, timeoutMs?: number): Promise<void>` — espera a que el spinner de análisis desaparezca y las secciones estén disponibles; lanza `Error("analysis_timeout")` si supera `timeoutMs` (default: 5 minutos)
- `navigateToSection(page: Page, section: SectionName): Promise<void>` — clickea el ícono de sidebar de la sección dada
- `waitForSectionLoaded(page: Page, section: SectionName, timeoutMs?: number): Promise<void>` — espera selector específico por sección + ausencia de spinners; lanza `Error("section_timeout")` si supera `timeoutMs`

**1.3 — `src/capture/record-section.ts` (reescribir implementación, preservar interface)**
- Signature existente se mantiene: `recordSection(runId: string, sectionName: SectionName): Promise<SectionRecord>`
- Recibe `page: Page` como nuevo parámetro adicional (o desde un módulo singleton)
- `page.screenshot({ path: ... })` reemplaza `scrot`
- `page.content()` para DOM dump → `dom.html`
- `page.evaluate()` para extraer URLs de assets usando selectores de `docs/selectors.md`
- `assetDownloader.downloadAll(urls, sessionCookies, outputDir)` para descargar assets

**1.4 — `src/capture/asset-downloader.ts`**
- `downloadAll(urls: string[], cookies: Cookie[], outputDir: string): Promise<AssetRecord[]>`
- Para cada URL: `fetch` con header `Cookie` construido desde las cookies de Playwright; guarda en `outputDir/001.ext`, `002.ext`, etc.
- Calcula `sha256`, `mime_type`, `size_bytes` para cada asset
- Un fallo en 1 asset no aborta el resto

**1.5 — Reescribir `src/agent/loop.ts` → `src/browser/run.ts`**
- Función principal: `runBrowserLoop(runId: string, brandUrl: string, manifest: RunManifest): Promise<LoopResult>`
- Flujo:
  1. Lanzar Chromium headless: `chromium.launch({ headless: true })`
  2. Restaurar sesión: `createContext(browser, sessionPath)`
  3. Navegar a Pomelli
  4. Verificar sesión válida — si no, lanzar `AgentErrorSignal("session_expired")`
  5. `dismissOnboarding(page)` si aparece
  6. `enterBrandUrl(page, brandUrl)`
  7. `waitForAnalysis(page)`
  8. Por cada sección disponible en orden: `navigateToSection` → `waitForSectionLoaded` → `recordSection`
  9. Generar screenshot final: `page.screenshot({ path: final.png })`
  10. Cerrar browser

**1.6 — Adaptar `src/cli.ts`**
- Reemplazar llamada a `runAgentLoop` por `runBrowserLoop`
- Agregar soporte de env vars: `BRAND_URL`, `RUN_ID`, `SESSION_PATH` (path al `storageState` JSON; default: `./google-session.json`)
- Agregar comando `login` que ejecuta `src/cli/login.ts`

**1.7 — Eliminar archivos obsoletos**
- `src/agent/loop.ts`, `src/agent/actions.ts`, `src/agent/tools.ts`, `src/agent/preflight.ts`
- `src/container/docker.ts`
- `docker-compose.yml` (o dejar con nota de deprecado si se quiere preservar para referencia)
- `Dockerfile` (ídem)
- `prompts/agent.md`, `prompts/changelog.md`

**1.8 — Validación end-to-end**
- `npm run wrap -- --url <url-real>` genera `outputs/<run_id>/` completo con manifest, screenshots y assets de al menos 3 secciones
- Tasa de éxito ≥80% sobre 3 URLs distintas

---

### Fase 2 — GitHub Actions workflow

GitHub Actions corre el mismo CLI sin Docker. Playwright instala Chromium nativo en el runner.

**2.1 — Encriptación y upload del `storageState`**
- Crear `scripts/encrypt-session.sh`: encripta `google-session.json` con `openssl enc -aes-256-cbc -pbkdf2`; sube el resultado a Supabase Storage en `sessions/active.json.enc`
- Crear `scripts/decrypt-session.sh`: descarga `sessions/active.json.enc` desde Supabase Storage; desencripta a un archivo temporal `google-session.json` en el runner

**2.2 — Workflow `.github/workflows/run-pomelli.yml`**
- Disparado por `workflow_dispatch` con inputs: `brand_url` (string, required), `run_id` (string, required)
- Job steps:
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` (Node 20)
  3. `npm ci`
  4. `npx playwright install chromium --with-deps` (instala Chromium y sus dependencias del sistema)
  5. Descargar y desencriptar `storageState` con `SESSION_ENCRYPTION_KEY` (GitHub Secret)
  6. `npm run wrap` con env vars: `BRAND_URL`, `RUN_ID`, `SESSION_PATH=./google-session.json`, `SUPABASE_URL`, `SUPABASE_KEY`, `OUTPUTS_MODE=supabase`
  7. Limpiar `google-session.json` del disco del runner (`rm -f`)
  8. Si el session hash cambió, re-encriptar y re-subir a Supabase Storage
- `timeout-minutes: 30` (Playwright es mucho más rápido que Computer Use — 30 min es suficiente)

**2.3 — Upload de assets a Supabase en tiempo real**
- En `record-section.ts`: después de guardar cada asset en disco, llamar `supabase.uploadAsset(runId, relativePath, buffer, contentType)` si `OUTPUTS_MODE=supabase`
- En `cli.ts`: al inicio del run, `supabase.updateRun(runId, { status: "running", started_at: new Date() })`; al final, `supabase.updateRun(runId, { status, finished_at, manifest })`

**2.4 — Smoke test**
- Disparar workflow manualmente desde la UI de GitHub Actions con una URL real
- Verificar assets en Supabase Storage dashboard y fila en tabla `runs` con `status: completed`

---

### Fase 3 — Supabase backend

**Schema SQL:**

```sql
create table runs (
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

**Buckets Supabase Storage:**
- `runs` (privado): `runs/<run_id>/manifest.json`, `runs/<run_id>/final.png`, `runs/<run_id>/agent-trace.jsonl`, `runs/<run_id>/sections/<name>/screenshot.png`, `runs/<run_id>/sections/<name>/dom.html`, `runs/<run_id>/sections/<name>/assets/<n>.<ext>`
- `sessions` (privado): `active.json.enc` + backups `active.json.enc.<timestamp>`

**`src/storage/supabase.ts` (archivo nuevo):**
- `uploadAsset(runId, relativePath, buffer, contentType)` → sube a bucket `runs`
- `updateRun(runId, fields)` → actualiza fila en tabla `runs`
- Cliente inicializado desde `SUPABASE_URL` + `SUPABASE_KEY` env vars

---

### Fase 4 — Web App Next.js

*(Interface idéntica a la planificada en V2 — agnóstica al stack de automatización)*

**Setup:**
- Next.js 15 App Router, TypeScript, Tailwind CSS
- Dependencia: `@supabase/supabase-js`
- Sin auth de usuario (web app interna abierta)
- Deploy en Vercel Hobby, root directory `web/`
- Env vars en Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `GITHUB_TOKEN` (PAT con `actions:write`), `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME`

**Rutas:**

| Ruta | Descripción |
|---|---|
| `GET /` | Redirect a `/runs` |
| `GET /runs` | Lista de todos los runs: ID, URL, status badge, fecha, cantidad de assets |
| `GET /runs/new` | Formulario: campo URL de marca, botón "Correr" |
| `POST /api/runs` | Crea fila en Supabase, dispara `workflow_dispatch` via GitHub API, retorna `{ run_id }`. 409 si hay un run en `running`. |
| `GET /runs/[id]` | Vista del run con polling cada 5s; thumbnails de assets; descarga via signed URLs |
| `GET /api/runs/[id]` | Retorna fila del run desde Supabase |
| `GET /api/runs/[id]/asset` | Genera y retorna signed URL para un asset dado (`?path=...`) |

**Banner `needs_reauth`:** si `status === "needs_reauth"`, mostrar instrucciones paso a paso para que el engineer corra `npm run login` localmente y re-suba el `storageState`.

---

### Fase 5 — Hardening

- Lock de concurrencia: `POST /api/runs` retorna 409 si hay un run activo
- Purge automático: Supabase Edge Function diaria, elimina assets de runs >30 días
- Demo: 3 URLs reales, tasa de éxito ≥80%, tiempo promedio <15 min
- `README.md`: setup para engineer nuevo (install Playwright, `npm run login`, `npm run wrap`); instrucciones de re-login cuando la sesión expira

---

## Archivos afectados

**Eliminados:**

| Archivo | Motivo |
|---|---|
| `src/agent/loop.ts` | Reemplazado por `src/browser/run.ts` |
| `src/agent/actions.ts` | xdotool/scrot → Playwright APIs |
| `src/agent/tools.ts` | Computer Use tools — ya no aplican |
| `src/agent/preflight.ts` | Lógica absorbida por `src/browser/navigation.ts` |
| `src/container/docker.ts` | Control via docker exec → Playwright nativo |
| `prompts/agent.md` | Prompt de Computer Use — eliminado |
| `prompts/changelog.md` | Idem |
| `Dockerfile` | Ya no se necesita para el browser |
| `docker-compose.yml` | Ya no se necesita |
| `start.sh` | Idem |

**Modificados:**

| Archivo | Cambio |
|---|---|
| `src/cli.ts` | Llamar `runBrowserLoop`; agregar comando `login`; soporte env vars `BRAND_URL`, `RUN_ID`, `SESSION_PATH` |
| `src/capture/record-section.ts` | Recibe `page: Page`; usa `page.screenshot()`, `page.content()`, `page.evaluate()` |
| `src/storage/local.ts` | Detectar `OUTPUTS_MODE=supabase`; llamar `supabase.uploadAsset` además de escritura local |
| `src/lib/types.ts` | Eliminar `SectionName` si se usa Computer Use; preservar `RunManifest`, `SectionRecord` |
| `src/lib/constants.ts` | Eliminar `MODEL`, `COMPUTER_USE_BETA`; agregar `SESSION_PATH`, `OUTPUTS_MODE` |
| `package.json` | Agregar `playwright` en devDependencies; agregar `@supabase/supabase-js`; agregar script `"login"` |
| `tsconfig.json` | Sin cambios esperados |
| `.gitignore` | Agregar `google-session.json` |
| `.env.example` | Reemplazar `ANTHROPIC_API_KEY` con `SESSION_PATH`, `SUPABASE_URL`, `SUPABASE_KEY` |

**Archivos nuevos:**

| Archivo | Descripción |
|---|---|
| `src/browser/session.ts` | `saveSession`, `createContext`, `isSessionValid` |
| `src/browser/navigation.ts` | `dismissOnboarding`, `enterBrandUrl`, `waitForAnalysis`, `navigateToSection`, `waitForSectionLoaded` |
| `src/browser/run.ts` | Loop principal con Playwright (reemplaza `src/agent/loop.ts`) |
| `src/cli/login.ts` | Abre Chromium visible, espera login manual, guarda `storageState` |
| `src/capture/asset-downloader.ts` | Descarga assets con cookies de sesión |
| `src/storage/supabase.ts` | Cliente Supabase + `uploadAsset`, `updateRun` |
| `docs/selectors.md` | Selectores Playwright confirmados en Fase 0 |
| `scripts/encrypt-session.sh` | Encripta y sube `storageState` a Supabase |
| `scripts/decrypt-session.sh` | Descarga y desencripta `storageState` |
| `.github/workflows/run-pomelli.yml` | Workflow de ejecución |
| `web/` | Next.js 15 App (Fase 4) |

---

## Constraints

- El formato de `manifest.json` **no cambia** — es el contrato de output
- `google-session.json` **nunca** va al repo ni a los logs — siempre encriptado en Supabase Storage privado
- El CLI `npm run wrap -- --url <url>` sigue siendo el entry point; los env vars son alternativas, no reemplazos
- Playwright usa **Chromium** (no Firefox) — es el canal más estable y el más usado por Playwright
- En GitHub Actions: `npx playwright install chromium --with-deps` instala las dependencias de sistema necesarias en ubuntu-latest
- `src/capture/record-section.ts` mantiene su signature pública — si se necesita agregar `page: Page` como parámetro, hacerlo como parámetro adicional opcional para no romper tests existentes
- El `storageState` se carga al inicio del run y no se modifica durante — Playwright puede escribir cookies nuevas automáticamente; al final del run se exporta de nuevo para detectar cambios

---

## Acceptance criteria

### Fase 0 — Spike Playwright

- [ ] `npx playwright install chromium` completa sin errores en Windows y ubuntu-latest
- [ ] `npm run login` abre Chromium visible, permite login manual de Google, genera `google-session.json`
- [ ] `scripts/spike-playwright.ts` navega a Pomelli, descarta el popup, ingresa una URL de marca, toma un screenshot que muestra contenido de Pomelli (no login screen)
- [ ] El spike descarga al menos 1 asset real desde Business DNA
- [ ] `docs/selectors.md` creado con selectores confirmados para popup, URL input, y al menos 1 sección

### Fase 1 — CLI Playwright completo

- [ ] `npm run wrap -- --url <url-real>` genera `outputs/<run_id>/manifest.json` con `status: completed`
- [ ] `outputs/<run_id>/sections/<name>/screenshot.png` existe para al menos Business DNA y Campaigns
- [ ] `outputs/<run_id>/sections/<name>/assets/` contiene ≥1 archivo por sección
- [ ] Cada asset tiene `mime_type`, `size_bytes`, `sha256` en `manifest.json`
- [ ] Un fallo en la descarga de 1 asset no aborta el run completo
- [ ] Si la sesión de Google expiró, el CLI termina con `status: needs_reauth` en el manifest y un mensaje claro en stdout
- [ ] Tasa de éxito ≥80% sobre 3 URLs distintas
- [ ] Tiempo por run <15 min en las 3 URLs

### Fase 2 — GitHub Actions

- [ ] `run-pomelli.yml` aparece en GitHub Actions con inputs `brand_url` y `run_id`
- [ ] Un run disparado manualmente termina con assets en Supabase Storage en `runs/<run_id>/`
- [ ] La fila en `runs` tiene `status: completed` y `manifest` no-null
- [ ] `google-session.json` es removido del disco del runner al final del job (no queda en caché)
- [ ] El job completa en <30 min
- [ ] Si la sesión expiró, el run queda con `status: needs_reauth` en Supabase

### Fase 3 — Supabase

- [ ] Tabla `runs` existe con todas las columnas del schema
- [ ] Bucket `runs` es privado — URL sin firmar retorna error
- [ ] Bucket `sessions` es privado
- [ ] `uploadAsset` sube y el archivo es accesible via `createSignedUrl`
- [ ] `updateRun` actualiza solo la fila correcta

### Fase 4 — Web App

- [ ] `/runs/new` valida formato de URL antes de submit
- [ ] `POST /api/runs` retorna 409 si hay un run activo
- [ ] `POST /api/runs` dispara el workflow (confirmable en GitHub Actions UI)
- [ ] `/runs/[id]` se actualiza cada 5 segundos sin reload
- [ ] Assets visibles como thumbnails y descargables via signed URLs
- [ ] Banner `needs_reauth` visible cuando corresponde

### Fase 5 — Hardening

- [ ] No es posible crear 2 runs simultáneos desde la web app
- [ ] 3 URLs reales: tasa de éxito ≥80%, tiempo promedio <15 min
- [ ] README explica setup completo para engineer nuevo

---

## Testing requirements

**Automatizado:**
- `src/browser/navigation.ts`: unit tests con una página HTML local que simula el popup y el input de Pomelli
- `src/capture/asset-downloader.ts`: unit tests con servidor HTTP local que sirve imágenes de prueba
- `POST /api/runs` API route: mock de GitHub API + Supabase; verificar 409 en conflicto y 201 en éxito

**Manual (smoke tests por fase):**

| Fase | Smoke test |
|---|---|
| 0 | Script de spike genera screenshot con contenido de Pomelli + 1 asset descargado |
| 1 | `npm run wrap -- --url <url>` end-to-end; inspeccionar `outputs/`; repetir con 3 URLs |
| 2 | Disparar workflow desde GitHub Actions UI; verificar Supabase Storage dashboard |
| 3 | Intentar leer bucket `sessions` sin autenticación — debe fallar |
| 4 | Abrir `/runs/new`, crear run, ver progreso en `/runs/[id]`, descargar un asset |
| 5 | Intentar crear 2 runs simultáneos — segundo retorna error visible |

---

## Open questions / assumptions

- **Selectores de Pomelli** — desconocidos hasta Fase 0. `docs/selectors.md` es el entregable clave de la fase. Si los selectores son muy inestables, considerar `page.getByText()` / `page.getByRole()` de Playwright (más resilientes que CSS selectors).
- **¿Assets de Pomelli requieren cookies para descargarse?** — Asumimos que sí. `asset-downloader.ts` usará las cookies del contexto de Playwright. Si resultan ser URLs públicas, simplificar.
- **¿Chromium es suficiente o Pomelli requiere Firefox?** — Asumimos Chromium. Si Pomelli detecta y bloquea Chromium, probar con `firefox` channel de Playwright. El spike de Fase 0 lo confirmará.
- **Expiración de `storageState`** — Google invalida sesiones periódicamente. No hay forma de predecir cuándo. El flujo de `needs_reauth` cubre esto.
- **`OUTPUTS_MODE=supabase` en local** — en desarrollo local se puede usar `OUTPUTS_MODE=local` (default) para no requerir Supabase. Solo GitHub Actions usa `supabase`.

---

## Out-of-scope protocol

- Desviaciones menores (renombrar variables, agregar logs) pueden proceder documentadas en el commit.
- Cualquier cambio que afecte el formato de `manifest.json`, el schema de Supabase, o el contrato de la API web requiere actualizar este spec antes de proceder.
- Computer Use, Docker-for-browser y Firefox profile: ya están fuera de scope. No volver a ellos sin nueva decisión documentada en el PRD.
