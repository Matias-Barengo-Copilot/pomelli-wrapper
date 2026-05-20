# Product Requirements Document: Pomelli Wrapper

**Status:** Active  
**Owner:** matias (matias@copilotinnovations.com)  
**Created:** 2026-05-18  
**Last Updated:** 2026-05-20  
**Versión actual:** 3.0 — Pivote a Playwright. Computer Use descartado.

---

## Executive Summary

Pomelli Wrapper automatiza Google Labs Pomelli (sin API pública) para extraer todos los outputs que genera a partir de una URL de marca: Business DNA, Campañas sociales, Photoshoot y Animate.

**El enfoque cambió.** V1 usó Claude Computer Use para controlar el browser. En la práctica, Computer Use resultó demasiado lento, costoso y poco confiable para una UI predecible y repetible como Pomelli: el modelo no podía encontrar botones visibles, consumía 20-35 iteraciones en pasos triviales, y el costo de ~$1–3 por run se concentraba en automatización de UI, no en valor real.

**Desde V3 el stack es Playwright.** La automatización del browser es 100% determinística, sin IA involucrada en la navegación. Playwright controla Chromium directamente, maneja sesiones de Google via `storageState`, y extrae assets parseando el DOM. El costo por run cae a $0 (solo compute de GitHub Actions).

**Claude puede re-entrar como post-procesamiento** en V4+: analizar la Business DNA capturada, generar variaciones de copy, estructurar los assets para exportación a Figma. Pero no controla el browser.

---

## Contexto y lecciones aprendidas

### El problema original

Pomelli no tiene API pública. El equipo lo usa manualmente: alguien entra a `labs.google.com/pomelli`, pega la URL del cliente, espera las generaciones, descarga assets a mano. No escala.

### Por qué se intentó Computer Use (y por qué se descarta)

La decisión original fue usar Computer Use para ser "resiliente a cambios de UI". En la práctica:

| Expectativa | Realidad |
|---|---|
| Resiliente a cambios de UI | Se perdía en pasos de un solo botón visible |
| Sin necesidad de mantener selectores | 20-35 iteraciones para encontrar un botón que está en el centro de la pantalla |
| Costo predecible ~$1–3/run | El costo era solo overhead de automatización, no valor |
| Fácil de iterar | Cada cambio de prompt requería correr runs completos para validar |

El intento de mejora con pre-flight via CDP redujo el problema pero no lo eliminó. El bottleneck era la captura de secciones, donde Computer Use seguía siendo necesario y seguía fallando.

**Conclusión:** Computer Use es una herramienta válida para tareas donde el objetivo es desconocido o altamente variable. Pomelli tiene un flujo de 5 pasos siempre igual — es exactamente el caso de uso donde Playwright gana.

### Qué queda del trabajo anterior

- El `Dockerfile` Ubuntu + Firefox + Xvfb puede descartarse o simplificarse
- El `record_section` / `manifest.json` / estructura de outputs se preserva
- El `preflight.ts` (CDP/puppeteer) desarrollado en V1 es la base directa del nuevo módulo Playwright
- La idea de Supabase + GitHub Actions como infraestructura se mantiene

---

## Stack

### V1 (descartado — Computer Use)

| Componente | Tecnología |
|---|---|
| AI | Claude Computer Use (`computer_20251124`) |
| Container | Ubuntu 22.04 + Firefox + Xvfb + VNC + xdotool + scrot |
| Costo por run | ~$1–3 (Anthropic API) |
| Confiabilidad | Baja — dependía de visión del modelo |

### V3 (actual — Playwright)

| Componente | Tecnología | Costo |
|---|---|---|
| Browser automation | **Playwright** (Chromium headless) | $0 |
| Lenguaje | TypeScript con `tsx` | $0 |
| Auth de Google | `storageState` de Playwright (JSON con cookies + localStorage) | $0 |
| Asset extraction | DOM parsing via `page.evaluate()` + descarga directa | $0 |
| Compute local | `npm run wrap -- --url <brand-url>` | $0 |
| Compute cloud | GitHub Actions (ubuntu-latest — Playwright corre sin Docker) | $0 |
| Backend | Supabase (Postgres + Storage) | $0 (free tier) |
| Web app | Next.js 15 en Vercel Hobby | $0 |
| Auth web app | NextAuth con Google | $0 |
| AI (post-procesamiento, V4+) | Claude API — análisis de assets capturados | TBD |

**Costo por run en V3: $0** (solo compute de GitHub Actions, ilimitado en repo público)

---

## Arquitectura

### V3 — Playwright local (fase actual)

```
Engineer (terminal)
  └─ CLI: npm run wrap -- --url <brand-url>
       └─ Playwright (Chromium headless)
            ├─ Restaura storageState (sesión de Google)
            ├─ Navega a labs.google.com/pomelli
            ├─ Descarta onboarding popup
            ├─ Ingresa brand URL → espera análisis
            └─ Por cada sección (DNA, Campaigns, Photoshoot, Animate):
                 ├─ Navega a la sección
                 ├─ Espera a que cargue (waitForSelector / networkidle)
                 ├─ Screenshot via page.screenshot()
                 ├─ DOM dump via page.content()
                 ├─ Extrae URLs de assets via page.evaluate()
                 ├─ Descarga assets
                 └─ Escribe en outputs/<run_id>/sections/<name>/
                    ↓
              outputs/ (disco local)
              manifest.json
```

### V3 Cloud — GitHub Actions (fase siguiente)

```
Usuario (browser)
  └─ Next.js App (Vercel)
       ├─ Login Google (@copilotinnovations.com)
       ├─ Formulario: brand URL → crea run en Supabase
       └─ Dispara workflow_dispatch → GitHub Actions

GitHub Actions Runner (ubuntu-latest)
  ├─ npx playwright install chromium
  ├─ Descarga storageState encriptado desde Supabase Storage
  ├─ npm run wrap -- --url $BRAND_URL --run-id $RUN_ID
  │    └─ Playwright corre nativo (sin Docker)
  │         ├─ Captura secciones
  │         ├─ Sube assets a Supabase Storage en tiempo real
  │         └─ Actualiza run en Supabase Postgres
  └─ Re-encripta y guarda storageState actualizado

Usuario (browser)
  └─ Ve historial, estado en tiempo real, descarga assets
```

**Ventajas sobre V1/V2:**
- Sin Docker en el runner de Actions → setup más simple y rápido
- `storageState` es un archivo JSON liviano (~50KB) vs. Firefox profile tar.gz (~200MB)
- Playwright en ubuntu-latest es plug-and-play: `npx playwright install chromium`

---

## Persistencia de la sesión de Google

Playwright guarda la sesión via `storageState`:

```typescript
// Guardar sesión después del login manual
await context.storageState({ path: "google-session.json" });

// Restaurar sesión en cada run
const context = await browser.newContext({
  storageState: "google-session.json",
});
```

`google-session.json` contiene cookies y localStorage. Es ~50KB. Se encripta (AES) y se guarda en Supabase Storage (`sessions/active.json.enc`).

**Flujo de auth:**
1. **Setup inicial (una vez):** Engineer corre `npm run login` → se abre Chromium visible, logea Google manualmente, `storageState` se exporta.
2. **Cada run:** El wrapper restaura `storageState` → sesión activa sin login.
3. **Expiración:** Playwright detecta redirect a login (`page.url().includes("accounts.google")`), lanza `report_error("session_expired")`. Un engineer re-corre `npm run login`.

---

## Módulos del nuevo stack

### `src/browser/session.ts`
- `saveSession(path)` — guarda `storageState` tras login manual
- `loadSession(path)` — restaura contexto con `storageState`
- `isSessionValid(page)` — verifica que la sesión siga activa

### `src/browser/navigation.ts`
- `navigateToPomelli(page, brandUrl)` — navega, descarta popup, ingresa URL, espera análisis
- `navigateToSection(page, section)` — click en el ícono de sidebar correcto
- `waitForSectionLoaded(page, section)` — `waitForSelector` + `networkidle` para cada tipo de sección

### `src/capture/record-section.ts` *(se preserva la interface)*
- Recibe `page` en lugar de actuar via `docker exec`
- `page.screenshot()` en lugar de `scrot`
- `page.content()` para DOM dump
- `page.evaluate()` para extraer URLs de assets

### `src/cli.ts`
- Agrega `npm run login` como comando separado para setup de sesión
- `npm run wrap -- --url <url>` sigue siendo el entry point principal

---

## Fases de implementación

### Fase 0 — Spike de validación Playwright *(estado actual)*

Validar que Playwright puede controlar Pomelli con sesión de Google activa.

| Tarea | Descripción | Criterio |
|---|---|---|
| 0.1 | Instalar Playwright (`npm i -D playwright`) y verificar que corre Chromium headless en Windows | `npx playwright install chromium` exitoso |
| 0.2 | `npm run login`: abre Chromium visible, navega a Google, permite login manual, guarda `storageState` | `google-session.json` generado |
| 0.3 | Script de spike: restaura `storageState`, navega a Pomelli, descarta popup, ingresa una URL de marca | Sin errores, llega al estado "analizando" |
| 0.4 | Confirmar que Playwright puede extraer al menos 1 asset de la sección Business DNA | URL de imagen capturada y descargada |
| 0.5 | Documento de selectores confirmados: onboarding popup, URL input, sidebar icons, sección cargada | `docs/selectors.md` |

**Criterio de salida de Fase 0:** Un script de ~50 líneas que navega Pomelli y descarga 1 asset real.

---

### Fase 1 — CLI completo con Playwright

| Tarea | Descripción |
|---|---|
| 1.1 | Reemplazar `src/agent/` y `src/container/docker.ts` con `src/browser/session.ts` + `src/browser/navigation.ts` |
| 1.2 | Adaptar `src/capture/record-section.ts` para recibir `page` de Playwright |
| 1.3 | Implementar detección y descarga de assets por sección (selectores confirmados en Fase 0) |
| 1.4 | `npm run wrap` funcional end-to-end sobre 1 URL real, sin Docker |
| 1.5 | Manejo de errores: sesión expirada, URL inválida, sección no disponible, timeout |
| 1.6 | `manifest.json` generado correctamente (preservar formato existente) |
| 1.7 | Validado sobre 3 URLs distintas — tasa de éxito ≥80% |

---

### Fase 2 — GitHub Actions

| Tarea | Descripción |
|---|---|
| 2.1 | Encriptar `google-session.json` con AES y subir a Supabase Storage |
| 2.2 | Workflow `.github/workflows/run-pomelli.yml`: instala Playwright, descarga y desencripta sesión, corre wrapper |
| 2.3 | Assets subidos a Supabase Storage en tiempo real durante el run |
| 2.4 | Run actualizado en Supabase Postgres al finalizar |
| 2.5 | Smoke test end-to-end desde GitHub Actions |

---

### Fase 3 — Web App Next.js

*(Sin cambios respecto al PRD anterior — la interfaz es agnóstica al stack de automatización)*

| Tarea | Descripción |
|---|---|
| 3.1 | Setup Next.js 15 + NextAuth Google + Supabase client |
| 3.2 | Auth: solo `@copilotinnovations.com` |
| 3.3 | `/runs/new`: dispara workflow, crea run en DB |
| 3.4 | `/runs/[id]`: estado en tiempo real, preview de assets |
| 3.5 | `/runs`: historial del equipo |
| 3.6 | Descarga de assets con Supabase signed URLs |

---

### Fase 4 — Hardening

| Tarea | Descripción |
|---|---|
| 4.1 | Límite de 1 run activo a la vez |
| 4.2 | Timeout del workflow: cancelar y marcar como `failed` si supera 40 min |
| 4.3 | Demo con 3 URLs reales, tasa de éxito ≥80%, tiempo <15 min p50 |
| 4.4 | Documentar re-login en README |

---

## Métricas de éxito

| Métrica | Target V1 (Computer Use) | Target V3 (Playwright) |
|---|---|---|
| Tasa de éxito end-to-end | ≥60% | ≥80% |
| Costo por run | <$3 | $0 |
| Tiempo por run | <25 min p50 | <15 min p50 |
| Iteraciones para onboarding | ~20 (real en V1) | 0 (determinístico) |
| Setup por máquina nueva | Docker Desktop + VNC | `npx playwright install chromium` |

---

## Requisitos no funcionales

### Performance
- Tiempo end-to-end: <15 min p50, <25 min p95
- Runs concurrentes: 1 (una sola sesión de Google a la vez)
- Storage por run: ~30–100 MB

### Seguridad
- `google-session.json` encriptado (AES) en Supabase Storage — nunca en el repo
- `ANTHROPIC_API_KEY` en Secrets solo si se agrega Claude en V4+
- Auth web app: solo `@copilotinnovations.com`
- Cuenta Google de automation: dedicada y sacrificable

### Plataforma
- CLI: Windows (Git Bash / PowerShell) y ubuntu-latest de Actions
- Playwright: Chromium headless (sin VNC, sin Xvfb, sin Docker)

---

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Google bloquea Playwright como bot | Media | Alto | Playwright por defecto elude fingerprinting básico. Si falla: agregar `playwright-extra` + stealth plugin. Último recurso: Browserbase. |
| Pomelli cambia DOM y rompe selectores | Media | Medio | Selectores documentados en `docs/selectors.md`. Alerta via error en Supabase. Fix en <1 día. |
| Sesión de Google expira en el runner | Media | Medio | `npm run login` local → re-exportar → subir. Flujo documentado. |
| Secciones de Pomelli no disponibles para la marca | Media | Bajo | `record_section` es opcional — si el selector no aparece en 2 min, se skipea y se registra en manifest. |

---

## Lo que NO está en scope (V3)

- ❌ Claude Computer Use — descartado
- ❌ Docker para control del browser — Playwright corre nativo
- ❌ VNC — el setup de sesión es via Chromium visible, sin VNC
- ❌ xdotool / scrot — reemplazados por APIs de Playwright
- ❌ Batch multi-URL simultáneo — un run a la vez
- ❌ Claude en el loop de automatización — puede re-entrar en V4+ como post-procesamiento

## V4+ (backlog)

- Claude API para analizar Business DNA y generar structured output (JSON con paleta, tipografía, tono de voz)
- Export Style Dictionary a Figma via API
- Browserbase si GitHub Actions IPs son bloqueadas por Google
- Batch multi-URL con queue
- Notificaciones Slack cuando un run termina

---

## Historial de versiones

| Fecha | Versión | Cambios |
|---|---|---|
| 2026-05-18 | 1.0 | Draft inicial: DNA extraction con Playwright + Browserbase + Next.js |
| 2026-05-18 | 1.1 | V1 mínimo solo imágenes de campañas |
| 2026-05-18 | 1.2 | Cambio de stack: Claude Computer Use + Docker local + CLI |
| 2026-05-19 | 2.0 | Migración V1→V2: GitHub Actions + Vercel + Supabase |
| 2026-05-20 | 3.0 | **Pivote a Playwright.** Computer Use descartado por confiabilidad. Playwright determinístico, $0/run. `storageState` reemplaza Firefox profile. Claude re-entra en V4+ como post-procesamiento. |
