# Yoonji Nam Portfolio

Single-page portfolio for Yoonji Nam, a Seoul-based product designer,
rebuilt from a Claude Design v2 mockup on a plain HTML/CSS/vanilla-JS
stack (no build step, no framework) with an AI chat "Agent" feature.

## Files

- `index.html` — the whole site: header, hero, About, How I Work, Impact
  stats, Works grids, Experience/Resume, Contact.
- `styles.css` — the ink/paper design system (see `SKILLS.md`), layout,
  and responsive rules.
- `work-data.js` — case-study content (one object per project: facts,
  metrics, narrative sections). Edit this to add or update a project.
- `case-overlay.js` — renders the work-card grids from `work-data.js` and
  the full-screen case-study detail overlay (click a card to open it).
- `motion.js` — GSAP scroll reveals, KPI count-up, scroll progress bar,
  and the light/dark invert toggle.
- `cursor-fx.js` — custom cursor ring/dot and magnetic-button hover
  effect (desktop pointer only).
- `chat.js` / `api/chat.js` / `chat-context.md` — the "Agent" chat panel.
  `chat-context.md` is the single source of information the AI answers
  from; edit that file to change what it knows, not the code.
- `SKILLS.md` — project-specific guidance for AI assistants editing this
  portfolio (design tokens, case-study data pattern, editing checklist).
- `vercel.json` / `package.json` — deployment config for the `/api/chat`
  serverless function.

## Local development

```bash
python3 -m http.server 8090
```

`api/chat.js` needs a real deploy (or `vercel dev`) to run — a plain
static server can preview everything else but not the chat responses.

## Deploying

Push to `main`; Vercel auto-deploys. `ANTHROPIC_API_KEY` must be set in
the Vercel project's environment variables for `/api/chat` to work.
