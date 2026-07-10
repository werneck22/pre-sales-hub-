---
name: amadeus
description: Apply the Amadeus brand (colors + typography) to this portal's UI. Use whenever styling, restyling, or reviewing the visual design of any screen, component, or CSS. Sourced from the official Amadeus PowerPoint theme (theme1.xml) — Amadeus Blue palette + Amadeus Neue / Inter Tight typography.
---

# Amadeus brand — visual system for the Pre-Sales Readiness Hub

Codifies the official Amadeus brand extracted from the Amadeus PowerPoint theme
(`ppt/theme/theme1.xml` clrScheme + fontScheme) plus the accent families used
across the deck's slides. Apply it through the CSS custom properties in
`styles.css :root`; components already read those tokens, so restyling means
editing the tokens, not every rule.

## Palette (official theme)

Core (theme color scheme):

| Role | Hex | Token |
| --- | --- | --- |
| Amadeus Blue (primary, buttons, active) | `#003B8F` | `--teal` / `--brand` |
| Bright Blue (interactive, links, focus, highlights) | `#3A8BFF` | `--teal-bright` / `--brand-bright` / `--blue` |
| Dark Navy (sidebar, headings, darkest ink) | `#000835` | `--nav` / `--ink` |
| Light Blue (soft fills, selected rows, chips) | `#C5D5F9` | `--teal-soft` / `--blue-line` |
| White | `#FFFFFF` | `--surface` |
| Blue-grey border | `#DEE6EF` | `--line` |

Purple accents (theme accent4–6, use sparingly for secondary emphasis such as
"conditional" states — never as a primary action color):

- `#59008F` `--purple` · `#B650FF` `--purple-bright` · `#BE8DFF` `--purple-soft`

Semantic families (from the deck slides — pair the dark shade as text on the
soft tint as background for readable pills/badges; the neon brights are for
small marks only, not large fills):

- Success: text `#023A00`, soft `#C8FFC0` → pill bg `#E6F6E8`
- Warning: text `#564A00`, soft `#FFFEB0` → pill bg `#FFF7D6`
- Danger: text `#560900`, bright `#FF514D` → pill bg `#FFE7E6`

## Typography

- **Display / headings**: **Amadeus Neue** (proprietary — not on any public
  CDN). Declared first in the stack so a self-hosted copy is picked up
  automatically; falls back to **Inter Tight**. Applied via `--font-display`
  to `h1–h4`, brand lockup, record name, page titles, and large metric numbers.
- **Body / UI**: **Inter Tight** (loaded from Google Fonts). `--font-sans`.
- Never fall back to Calibri/Arial/system defaults — always keep Inter Tight in
  the stack before the generic `sans-serif`.

To enable true Amadeus Neue: self-host the licensed font files and add an
`@font-face` for `"Amadeus Neue"` (weights Light, Light Italic, Black Italic);
no other change needed — the stacks already prefer it.

Google Fonts load (in `index.html`):
`https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,300..800;1,300;1,400&display=swap`

## Usage rules

- Primary actions and the active/selected state use **Amadeus Blue #003B8F**;
  hovers/pressed go darker (`--teal-dark #002a66`).
- **Bright Blue #3A8BFF** is the accent — links, focus rings, small highlights,
  progress fills — not large backgrounds.
- The sidebar/nav is **Dark Navy #000835**.
- Selected table/queue rows and soft chips use **Light Blue #C5D5F9** tints.
- Keep the UI calm: one primary blue action per view; purples and neon accents
  are garnish, used on ≤1 element per screen.
- Maintain WCAG AA contrast: navy/Amadeus-blue text on white/light-blue passes;
  never put Bright Blue text on Light Blue.

## When restyling

1. Edit tokens in `styles.css :root` (this is the single source of truth).
2. Apply `--font-display` to any new heading-level element.
3. Verify headless with zero JS errors and screenshot the changed routes.
4. Bump the asset `?v=` + `Build vN` and confirm the Pages deploy (see CLAUDE.md).
