# Airport IT Pre-Sales Readiness Hub

Local static prototype for an Airport IT pre-sales operational readiness portal.

## How To Run

Live preview: https://werneck22.github.io/pre-sales-hub-/

Or serve the folder locally with any static web server, e.g. `python3 -m http.server 4173`, then open http://127.0.0.1:4173/index.html.

Opportunity, sizing, validation, risk, and decision data is saved to the browser's `localStorage` so work survives a page reload. It stays local to that browser only.

## What The Prototype Demonstrates

- Opportunity intake and readiness evidence.
- Product scope selection.
- Configurable mock airport categorization.
- Automated mock sizing by product and workstream.
- Resource owner registry.
- Validation requests and status tracking.
- Simulated email notification previews.
- Risks, assumptions, stakeholder validation, and decisions.
- BCM, SRM, and BAB readiness rules.
- Executive dashboard with readiness, blocker, and sizing validation metrics.
- Business case pack with validated effort by workstream and historical benchmark comparison.

## Automated Sizing & Resource Validation Engine

The sizing engine is the main MVP pillar. It classifies an airport from annual passengers and movements, applies mock sizing rules to selected products, estimates MD by workstream, assigns resource owners, generates validation requests, and previews email notifications.

The MVP uses mock rules only. It does not include real pricing, confidential formulas, customer data, or live email integrations.

## Key Files

- `index.html` - prototype UI
- `styles.css` - visual styling
- `modules/` - app logic, loaded as native ES modules (no build step)
  - `data.js` - constants, mock reference data, and pure formatting helpers
  - `state.js` - the mock database, persistence, UI state, and DOM element cache
  - `sizing-engine.js` - sizing rule calculations and the validation/notification workflow
  - `readiness-rules.js` - BCM/SRM/BAB readiness scoring
  - `render.js` - all screen rendering
  - `actions.js` - form sync and mutation handlers
  - `main.js` - event wiring and app bootstrap (entry point)
