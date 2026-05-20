# Agent Prompt Changelog

This file tracks what we learn from real Pomelli runs. Update it after every run that reveals new UI behavior, a new failure mode, or a more efficient navigation path.

---

## 2026-05-19 — First real run (smoke test)

**Brand URL tested:** (unknown — first run)

**What we observed:**
- Pomelli already had a Brand DNA loaded from a previous session. The agent did not know to remove it first and got stuck.
- After the brand was removed manually, Pomelli showed an onboarding popup. The agent dismissed the popup correctly.
- The agent could not find the "Let's Go" button after the popup was dismissed and looped endlessly, alternating between the URL bar and other parts of the app without making progress.

**Changes made to agent.md:**
- Added Step 0: state detection with 5 explicit states (A through E) before any other action
- State A: Brand already loaded → find and use "Remove brand" / "Reset" option
- State B: Onboarding popup visible → find "Let's Go" / "Got it" / close button and dismiss
- State C: URL input ready → enter brand URL
- Added stuck-loop detection rule: if 5+ consecutive screenshots show no progress, call report_error("timeout", ...)

**Still unknown:**
- Exact label and location of the "Remove brand" option in the `⋮` menu
- Whether the onboarding popup appears every time after brand removal, or only once per session
- What the third sidebar icon (megaphone) maps to — Social, Animate, or something else

---

## 2026-05-19 — `click_element` tool confirmed working

**What we confirmed:**
- `clickElementInBrowser` correctly injects `javascript:` URLs via the address bar using base64 + execFile (avoids Windows cmd.exe quote-mangling)
- Address bar reverts to the page URL after execution — no stuck `javascript:` URL visible
- CSS class `.continue-button` confirmed from DOM inspection of the onboarding button
- Exact button HTML: `<button class="mdc-button continue-button priority-button ..."><span>Let's go!</span></button>`
- The `⋮` menu in the top-right corner is the location of the "Remove brand" option
- Campaigns section URL: `labs.google.com/pomelli/` (same base URL, section switching appears client-side)
- Left sidebar: 5 section icons confirmed (DNA, Campaign, unknown-3, Camera, Wand)

**click_element tool implementation:**
- Uses `execFile` (not `exec`) to bypass Windows cmd.exe shell quoting
- JS URL is base64-encoded before passing to bash — no shell metacharacters
- Decoded inside the container via `$(echo B64 | base64 -d)` expansion
