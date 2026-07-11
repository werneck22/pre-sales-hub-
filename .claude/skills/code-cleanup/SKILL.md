---
name: code-cleanup
description: Review code to remove duplication, delete dead/unnecessary lines, and optimize functionality without changing behavior. Use for "clean up", "refactor", "remove duplication", "simplify", "dedupe", "optimize", "tidy", or any request to tighten existing code. Behavior-preserving by default; tailored to this static ES-module portal (no build step, headless verification, product-catalog spread).
---

# Code cleanup — dedupe, prune, optimize (this repo)

Tighten existing code without changing what it does. Three jobs, in order of
value: **remove duplication**, **delete what's unnecessary**, **optimize the
work that remains**. Behavior stays identical unless the user asks otherwise —
if a cleanup would change output, stop and flag it.

Lean on the built-ins instead of reinventing them:
- **`/simplify`** — reviews the changed code for reuse/simplification/
  efficiency and *applies* the fixes. This is the workhorse; run it after you
  scope the change.
- **`/code-review`** — checks the diff for correctness bugs. Run it *after*
  cleanup to prove you didn't break anything.

## What to hunt for

1. **Duplication (highest priority).**
   - Repeated literals/logic → one constant or helper. In this repo, pure
     helpers live in `data.js`; DOM/state helpers in `state.js`; rendering
     helpers in `render.js`. Put the extraction where its siblings already are.
   - Copy-pasted render blocks → a small function or a mapped template.
   - **Catalog duplication is structural here:** a product's facts are spread
     across `PRODUCT_NAMES`, family maps, rule codes, workstream bases, drivers,
     resource owners, seed scopes, benchmarks, and the migration. Don't "dedupe"
     these into one place — they're intentionally parallel. Instead, verify they
     stay *consistent* (run the `catalog-consistency` agent). Flag drift; don't
     collapse the structures.

2. **Unnecessary lines / dead code.**
   - Unused variables, imports, params, exports, and unreachable branches.
   - Dead CSS rules and selectors that no markup produces.
   - Redundant re-computation, no-op guards, commented-out code, stale TODOs.
   - Over-defensive checks for states that cannot occur.

3. **Optimization (only where it's real).**
   - Hoist work out of loops/hot render paths; avoid recomputing derived values
     every render when they can be computed once.
   - Prefer a single pass over repeated `.filter().map().find()` chains on the
     same array when it's on a hot path.
   - Don't micro-optimize cold paths or trade readability for nanoseconds. Clear
     beats clever.

## Guardrails (do not break these)

- **Behavior-preserving.** Same inputs → same outputs and same DOM. If unsure,
  it's a behavior change — ask.
- **Never touch sizing effort (MD) values** to "simplify." Effort numbers come
  only from real rules (see CLAUDE.md non-negotiables). Cleanup is structure,
  not numbers.
- **Keep the module-graph versioning intact.** Every internal `import` carries
  `?v=YYYYMMDD-N`; don't strip it. If you ship a code change, bump the version
  and `Build vN` per CLAUDE.md.
- **Don't widen scope.** Clean the code in play (the diff / the files named),
  not the whole repo, unless asked.

## Method

1. **Scope** — identify the changed/target files. Read them fully before
   cutting.
2. **Map duplication and dead code** — grep for repeated literals and
   copy-paste; note unused symbols. Draft the extractions.
3. **Apply** — make the edits, or run **`/simplify`** to apply the reuse/
   simplification pass, then hand-finish anything it missed.
4. **Prove behavior is unchanged** — serve headless
   (`python3 -m http.server 4173`), drive the affected routes with
   playwright-core, require **zero JS errors**; screenshot if visual. Run
   **`/code-review`** on the diff.
5. **If the catalog was touched** — run the `catalog-consistency` agent and, for
   sizing, the `sizing-verifier` agent.
6. **Ship** — bump `?v=` + `Build vN`, commit with a clear message, confirm the
   deploy.

## Definition of done

- [ ] No duplicated literals/logic left in scope (or justified if parallel-by-design).
- [ ] No unused imports/vars/exports, dead branches, or dead CSS.
- [ ] Any optimization is on a real hot path and keeps readability.
- [ ] Behavior identical — zero JS errors headless; `/code-review` clean.
- [ ] Sizing MD untouched; catalog still consistent (if touched).
- [ ] `?v=` + `Build vN` bumped; deploy confirmed.
