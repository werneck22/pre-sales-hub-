# Airport IT Pre-Sales Readiness Hub

Local static prototype for an Airport IT pre-sales operational readiness portal.

## How To Run

Open the existing local preview:

http://127.0.0.1:4173/index.html

Or serve the folder with any static web server.

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
- `app.js` - mock data, readiness rules, sizing engine, and interactions
- `docs/PRD.md` - product requirements
- `docs/data_model.md` - entity model
- `docs/readiness_rules.md` - BCM/SRM/BAB and sizing readiness rules
- `docs/demo_script.md` - guided demo scenario
