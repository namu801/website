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
one object in `work-data.js` (`WORKS` array) with `facts` (Background/
Problem/Approach/Outcome) and `metrics`. `case-overlay.js` renders the
work-card grids on the homepage and the full-screen detail overlay from
that data — to add or edit a case study, edit `work-data.js` only. There
is no separate narrative/"secs" section anymore; the Overview facts are
the whole detail page. Each entry should cover:

- The existing product or flow, and the problem/friction.
- The approach taken.
- The measurable or qualitative outcome.

Prefer concrete evidence over generic claims: before-after states, ratings,
percentages, awards, or field-research counts (see existing entries in
`work-data.js` for the expected level of specificity).

## Asset Rules

Each `WORKS` entry in `work-data.js` has a `slug` and an `images: []`
array. Real photos/screenshots live in `images/<slug>/`, named in
display order (`01.jpg`, `02.jpg`, ...); populate the `images` array
with those paths in the same order. `case-overlay.js` uses
`images[0]` as the card thumbnail, the case-study hero image, and the
"more case studies" thumbnail, and renders the rest as a stacked
gallery inside the case-study detail page. A project with an empty
`images` array keeps the CSS dither-pattern placeholder (see Design
Direction above) instead of a broken image — don't remove that
fallback. Do not link to external image URLs.

## Chat Agent

`chat.js` drives the "Agent" panel; its "생각 중" bubble uses
`thinking-orb.js`, a vendored vanilla-JS build of the canvas engine
from the `thinking-orbs` npm package (MIT, by Jakub Antalik) — see the
file's header comment for the source repo and license. That package
ships a React component; `thinking-orb.js` is a framework-free rebuild
of the same engine (no React, no build step at runtime) bundled once
with esbuild from a local `vanilla.ts` entry point against a clone of
the upstream repo. To change the orb's state/size, edit the
`createThinkingOrb(canvas, { state, size, theme, ariaLabel })` call in
`chat.js`'s `addThinkingBubble()` — valid states and the 64/20 size
presets are documented in the upstream README. To pull in an upstream
update, re-clone the repo, re-create `src/vanilla.ts` (wraps
`resolvePreset` + `MODE_DRAWS` in plain DOM/canvas calls — no JSX), and
re-bundle with `esbuild src/vanilla.ts --bundle --format=iife
--global-name=ThinkingOrbs --outfile=thinking-orb.js`.

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
