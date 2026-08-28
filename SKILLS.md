# AI Usage Guide for Yoonji Nam's Portfolio

Use this file when asking an AI assistant to help edit or extend this portfolio.

## Portfolio Goal

This site represents Yoonji Nam, a product designer in Seoul, South Korea who is seeking a full-time product design role. Keep the tone polished, restrained, and hiring-focused. Do not position Yoonji as a freelancer.

## Design Direction

As of the v2 redesign (ported from a Claude Design mockup), the site uses a
monochrome ink/paper system, not the original muted-plum template:

- Two tokens carry the whole palette: `--paper` (background) and `--ink`
  (foreground), plus muted variants `--ts-paper`/`--ts-ink`,
  `--line-paper`/`--line-ink`, and `--fill`/`--paper-2` — defined in
  `styles.css`. Sections alternate ink-background and paper-background
  deliberately (hero, Impact, Experience = ink; About, Approach, Works,
  Contact = paper) — keep that alternation when adding sections.
- A global light/dark **invert** toggles by swapping those custom
  properties under `html[data-invert="1"]` (see `motion.js`). Any new
  section should use the existing tokens, not hardcoded colors, so invert
  keeps working.
- Typography is Pretendard (loaded via jsdelivr in `index.html`), bold
  headings, generous line-height on body copy.
- Backgrounds for project imagery are the CSS-only "dither" dot pattern
  (`[data-dither]` in `styles.css`) — no image assets. Keep using it for
  placeholders until real product screenshots replace them.
- Motion (GSAP scroll reveals, KPI count-up, custom cursor, magnetic
  buttons) lives in `motion.js` / `cursor-fx.js`, gated behind
  `prefers-reduced-motion` and `(pointer: fine)` respectively — don't
  remove those guards.

## Case Studies

Case-study content is data, not separate HTML pages. Each project lives as
one object in `work-data.js` (`WORKS` array) with `facts`, `metrics`, and
`secs` (narrative sections). `case-overlay.js` renders the work-card grids
on the homepage and the full-screen detail overlay from that data — to
add or edit a case study, edit `work-data.js` only. Each entry should
cover:

- The existing product or flow, and the problem/friction.
- The approach taken.
- The measurable or qualitative outcome.

Prefer concrete evidence over generic claims: before-after states, ratings,
percentages, awards, or field-research counts (see existing entries in
`work-data.js` for the expected level of specificity).

## Asset Rules

No local `images/`/`icons/` folders are in active use — all current
imagery is the CSS dither-pattern placeholder (see Design Direction
above). If real screenshots are added later, store them inside this
project folder and reference them with a relative path from the file
being edited; do not link to external image URLs.

## Resume Guidance

The resume section should stay concise. Prioritize full-time roles, product scope, shipped work, collaboration with PMs and engineers, and measurable design impact.

## Editing Checklist

Before finishing any AI-generated update:

- Confirm colors come from the `--paper`/`--ink`/`--ts-*`/`--line-*`/`--fill`
  tokens in `styles.css`, not hardcoded hex values, so `data-invert` keeps
  working.
- Confirm placeholder copy still tells Yoonji what to add.
- Confirm case-study edits went into `work-data.js`, not new HTML pages.
- Confirm `prefers-reduced-motion` and `(pointer: fine)` guards in
  `motion.js`/`cursor-fx.js` are still respected by any new animation.
