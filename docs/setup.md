# Setup Guide — Pomelli Wrapper

Seguí estos pasos en orden. Podés retomar desde donde dejaste después de cualquier restart.

---

## Estado actual del proyecto

- [x] Código base implementado (`npm run wrap -- --url <url>`)
- [x] `ANTHROPIC_API_KEY` en `.env`
- [ ] WSL2 instalado
- [ ] Docker Desktop instalado y corriendo
- [ ] Container construido (`docker compose up -d --build`)
- [ ] Login manual a Google/Pomelli via VNC
- [ ] Primer run de prueba exitoso

---

## Paso 1 — Instalar WSL2

Abrí **PowerShell como Administrador** y ejecutá:

```powershell
wsl --install
```

Reiniciá la PC cuando te lo pida. Después del restart va a terminar de configurar Ubuntu automáticamente — dejalo terminar, te va a pedir un username y password para Ubuntu (puede ser cualquier cosa, no se usa después).

**Verificar:**
```powershell
wsl --status
```
Tiene que decir "Versión predeterminada: 2".

---

## Paso 2 — Instalar Docker Desktop

Desde cualquier terminal (no necesita admin):

```
winget install Docker.DockerDesktop
```

Después de instalar, abrí Docker Desktop desde el menú inicio. La primera vez:
1. Aceptá el acuerdo de licencia
2. Settings → General → confirmá que **"Use the WSL 2 based engine"** esté tildado
3. Esperá a que el ícono de ballena en la taskbar deje de moverse (puede tardar 1-2 min)

**Verificar:**
```
docker --version
docker compose version
```

---

## Paso 3 — Construir el container

Desde la carpeta del proyecto (`C:\Copilot\proyectos\r-d\pomelli-wrapper`):

```
docker compose up -d --build
```

La primera vez tarda ~5-10 minutos porque descarga Ubuntu y las dependencias. Las siguientes veces arranca en segundos.

**Verificar:**
```
docker ps
```
Tiene que aparecer `pomelli-computer` con estado `Up`.

---

## Paso 4 — Login manual a Google/Pomelli via VNC (una sola vez)

1. Instalá un cliente VNC. El más simple en Windows es **TightVNC Viewer**:
   ```
   winget install TightVNC.TightVNC
   ```
   O descargalo desde `https://www.tightvnc.com/download.php`

2. Abrí TightVNC Viewer y conectate a:
   ```
   localhost:5900
   ```
   (sin contraseña — dejá el campo vacío)

3. Vas a ver el escritorio del container con Firefox abierto.

4. En Firefox, navegá a `https://labs.google.com/pomelli` y loguéate con la cuenta Google de automation.

5. Confirmá que ves el dashboard de Pomelli (que no haya pedido 2FA ni nada raro).

6. Cerrá el VNC viewer. El login queda guardado en el volumen Docker `firefox-profile` y sobrevive reinicios del container.

**¿Cómo saber si la sesión sigue activa?** Reconectá por VNC y navegá a `labs.google.com/pomelli` — si carga sin pedir login, está todo bien.

---

## Paso 5 — Primer run de prueba

```
npm run wrap -- --url https://stripe.com
```

El agente va a:
1. Abrir Firefox en el container y navegar a Pomelli
2. Pegar la URL de Stripe
3. Recorrer todas las secciones disponibles (Business DNA, Campaigns, etc.)
4. Guardar screenshots por sección en `outputs/run-<timestamp>/`

Al terminar vas a ver en consola el resumen con status, secciones, assets, duración y costo.

**Output esperado:**
```
outputs/
  run-20260519-103022/
    manifest.json
    agent-trace.jsonl
    sections/
      business_dna/screenshot.png
      campaign/screenshot.png
      ...
```

> **Nota:** En este punto los assets (imágenes, videos) todavía no se descargan — solo screenshots. La descarga de assets es el trabajo del Día 4. Lo importante en el primer run es confirmar que el agente navega Pomelli correctamente.

---

## Comandos de referencia rápida

```bash
# Levantar container (si no está corriendo)
docker compose up -d

# Apagar container
docker compose down

# Ver logs del container
docker logs pomelli-computer

# Correr el wrapper
npm run wrap -- --url https://cliente.com

# Correr con carpeta de output personalizada
npm run wrap -- --url https://cliente.com --out ./mis-outputs

# Reconectar a VNC para inspeccionar el browser
# Abrí TightVNC Viewer → localhost:5900

# Verificar que el container está corriendo
docker ps
```

---

## Si algo sale mal

**Container no arranca:**
```
docker compose down
docker compose up -d --build
```

**Sesión de Google expiró:**
Reconectá por VNC (`localhost:5900`) y volvé a loguear manualmente.

**El agente reporta `needs_human`:**
Abrí `outputs/<run_id>/manifest.json` y mirá el campo `error` — probablemente captcha o sesión expirada. Reconectá por VNC para resolverlo.

**El run no termina o cuesta demasiado:**
`Ctrl+C` en la terminal. El manifest parcial quedó guardado. Revisá `outputs/<run_id>/agent-trace.jsonl` para ver en qué paso se trabó.
