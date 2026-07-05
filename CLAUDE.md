# CLAUDE.md — Airport IT Pre-Sales Readiness Hub

Context for any Claude Code session working on this repository.

## What this is

A **static, client-side** portal for scoping, sizing, and validating Airport IT
BIDs, from opportunity intake to the Solution Review Meeting (SRM). No build
step, no backend — plain ES modules loaded directly by `index.html`, state kept
in the browser's `localStorage`. Deployed via **GitHub Pages** from `main`.

The end goal is to automate the **SRM** (Solution Review Meeting). Everything
should converge toward getting an opportunity to a validated, review-ready SRM
package.

## Files

- `index.html` — single page; all screens are sections toggled by hash route.
- `styles.css` — all styling (large; one file).
- `modules/`
  - `data.js` — constants, product catalog, sizing rules/drivers, mock reference data, pure helpers.
  - `state.js` — `mockDb`, `localStorage` persistence + migration, DOM element cache, routing.
  - `sizing-engine.js` — sizing calculation, validation workflow, CSV export, notifications.
  - `readiness-rules.js` — BCM/SRM/BAB readiness scoring and gap analysis.
  - `render.js` — all screen rendering (large).
  - `actions.js` — form sync and mutation handlers; opportunity creation.
  - `airport-directory.js` — bundled airport reference data + search.
  - `airport-search.js` — header search dropdown → create opportunity from an airport.
  - `airport-lookup.js` — per-code Wikidata traffic lookup.
  - `main.js` — event wiring and bootstrap (entry point).

## Non-negotiable rules

1. **Never invent sizing effort (MD).** Effort values come only from real
   rules/examples the product owner provides. Existing numbers in
   `productWorkstreamBase` are mock placeholders. New products carry **no**
   effort until real rules exist — see `PRODUCTS_AWAITING_SIZING` in `data.js`
   (`FRMS`, `Seamless GT11 eGate - Biometric`); they show "sizing rules pending".
2. **No confidential data in the repo.** The repo/Pages is public. Historical
   BIDs and real sizing data must never be committed.
3. **Product catalog is data.** Product definitions are provided incrementally;
   keep them in `data.js` structures, not hardcoded in views.

## Product catalog (data.js)

- `PRODUCT_NAMES` — the catalog. `productFamily()` groups them for the Scope UI.
- Families/suite: **Common Use**, **Self-Service & Baggage**, **Biometrics &
  Identity**, **AMS - Amadeus Management Solutions** (AODB, FRMS, DDS), **Seamless
  - Hardware** (eGate Non Biometric / Biometric / Biopod), **Seamless - Software**
  (Journey Platform Lite / Full), **Support**.
- `productSizingDrivers` — per-product quantity drivers. A driver with
  `computed: { op, sources }` is **read-only and derived** (e.g. CUPPS
  "positions (total)" = check-in counters + boarding gates; weight 0 so it does
  not double-count).
- `PRODUCT_LINKS` — soft links (Integrations & APIs → AODB).
- ABD uses model subcategories (S1 Mini, S1 T2, S7) as separate unit drivers.
  Integrations & APIs uses 4 complexity-level drivers (L1–L4).
- When you rename/add a product, update **all** of: `PRODUCT_NAMES`,
  `PRODUCT_FAMILY_MAP`/`productFamily`, `productRuleCodes`,
  `productWorkstreamBase`, `productSizingDrivers`, `buildResourceOwners`, the
  seed `productScopes` in `state.js`, `demoScenarioSteps` in `render.js`, and
  `MOCK_BENCHMARKS`. Add a rename entry to the migration in `state.js`
  `migrateMockDb`. (The `catalog-consistency` agent checks this.)

## State & persistence

- `mockDb` seed lives in `state.js`. Persisted under `presalesHub.state.v2`.
- `migrateMockDb` always regenerates reference data (classification rules,
  sizing rules, owners) from the current build and renames products, so
  returning users pick up catalog changes without a reset.
- "Reset demo data" (sidebar) clears `localStorage` and reloads the seed.
- Dates: real current date drives deadlines/overdue. Guided demo temporarily
  freezes the clock to `DEMO_FROZEN_TODAY` (see `setReferenceToday`).

## Governance domain

- Deal Desk = Sales governance with gates **BCM → SRM → BAB**.
- Readiness is computed (`readiness-rules.js`); intake statuses are inputs, not
  the readiness itself.

## Running / verifying locally

No build. Serve the folder and drive it headless:

```bash
python3 -m http.server 4173   # then open http://127.0.0.1:4173/index.html
```

Playwright (playwright-core, Chromium at `/opt/pw-browsers/...`) is the
verification pattern used in this repo: load `#/<route>`, `localStorage.clear()`,
reload, screenshot / assert. Capture `pageerror` + console errors and require
**zero JS errors** across all routes (dashboard, intake, scope, sizing,
validation, governance, stakeholders, risks, decisions, businessCase, demo).

## Deploy flow (important)

- `main` auto-deploys to GitHub Pages (`werneck22.github.io/pre-sales-hub-/`).
- **Always bump the asset version** (`?v=YYYYMMDD-N` on the CSS/JS links in
  `index.html`) and the visible **`Build vN`** tag in the sidebar footer on any
  change, so cache busts and the deployed build is verifiable at a glance.
- `index.html` carries `no-cache` meta tags; assets are `?v=` cache-busted.
- After merging, **verify on `main`**: confirm the merge included your last
  commit and that the Pages build succeeded (the merge can miss a late commit —
  it happened once). The `deploy-verifier` agent automates this.
- This sandbox cannot reach `github.io` (proxy 403), so live content can't be
  fetched here — rely on git state + GitHub Actions Pages build status.

## Available analysis agents (.claude/agents)

- `catalog-consistency` — product catalog is consistent across all structures.
- `design-reviewer` — screenshots each route, flags visual clutter/inconsistency.
- `copy-auditor` — verbose/unprofessional microcopy, slashes in names.
- `sizing-verifier` — runs sizing headless and checks invariants.
- `deploy-verifier` — main is up to date and the Pages build succeeded.
