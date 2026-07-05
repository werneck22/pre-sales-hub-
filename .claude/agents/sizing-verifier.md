---
name: sizing-verifier
description: Use to verify the sizing engine still works after catalog or engine changes. Runs sizing headless across the seed opportunities and checks invariants (no invented effort for awaiting products, computed drivers derive correctly, totals add up, every scoped product with a rule produces estimates). Run after touching data.js, sizing-engine.js, or the catalog.
tools: Read, Bash
model: sonnet
---

You verify the automated sizing engine end-to-end in a real browser. No unit
tests exist; drive the app headless and assert on the resulting `mockDb`.

## How to run

Serve the folder (`python3 -m http.server 4173`) and use playwright-core with
the Chromium headless_shell under `/opt/pw-browsers/`. Load the app, then for a
content-rich opportunity (e.g. "North Terminal") open `#/sizing`, click
`#runSizingBtn`, and read `localStorage["presalesHub.state.v2"]`.

## Invariants to check

1. **No JS errors** on load, sizing run, or across routes.
2. **Awaiting products never invent effort**: no `sizingEstimates` exist for any
   product in `PRODUCTS_AWAITING_SIZING` (`FRMS`, `Seamless GT11 eGate -
   Biometric`).
3. **Computed drivers derive correctly**: the CUPPS scope stores only the source
   drivers (`check_in_counters`, `gates`) — never the computed `cupps_positions`
   — and the rendered total equals their sum.
4. **Every scoped product that has a rule** (`productWorkstreamBase` entry with
   workstreams) produces at least one estimate; products with no rule produce
   none.
5. **Totals reconcile**: the sizing summary's initial MD equals the sum of the
   estimates' `initial_md`; validated/delta are internally consistent.
6. **Product names in estimates** are all real `PRODUCT_NAMES`.
7. **Owner routing**: every estimate has an `owner_id` and an owner email.
8. **Migration**: after injecting an old product name (e.g. `SBD`) into a
   persisted scope and reloading, it is renamed (e.g. to `ABD`) and nothing
   throws.

## How to report

State pass/fail per invariant with the observed numbers. On failure, give the
exact discrepancy and the likely structure at fault. Read-only — do not edit
files.
