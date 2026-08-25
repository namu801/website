# Yoonji Nam Portfolio Template

Minimal static portfolio template for a Seoul-based product designer seeking a full-time role.

## Files

- `index.html` contains the homepage, project cards, resume section, about section, and contact information.
- `case-study.html` is the reusable detail page that every project card can link to.
- `styles.css` contains the visual system, responsive layout, and point color.
- `SKILLS.md` gives AI assistants project-specific guidance for editing the portfolio.
- `design-tokens.json` stores the core colors, typography, radius, and layout tokens.
- `design-system.json` describes the portfolio components and asset rules in structured form.
- `images/` is where all portfolio images, screenshots, prototypes, and 3D animation assets should go.
- `icons/` is where all local SVG or image icons should go.

## What to Replace

- `yoonji.nam@example.com` with Yoonji's real email.
- LinkedIn and website URLs in the contact section.
- Resume PDF link in the resume section.
- Hero placeholder with a 3D interactive animation, such as a small WebGL scene, Spline embed, or product-process interaction.
- Project card placeholders with product screenshots or prototype previews.
- Case study hero placeholder with the product screen or final feature mockup.
- Process placeholders with AI prototyping artifacts, flow maps, prompt snippets, before-after screens, or usability notes.
- Case study text with a real product, real design decisions, and measurable outcomes where available.

## Asset Folders

Store all images in:

`/Users/username/Desktop/AI Prototyping Studio/images/`

Store all icons in:

`/Users/username/Desktop/AI Prototyping Studio/icons/`

When adding images or icons to HTML or CSS, use relative paths:

```html
<img src="images/project-preview.png" alt="Project preview" />
<img src="icons/arrow-up-right.svg" alt="" aria-hidden="true" />
```

Do not use external image URLs or remote icon libraries for this template. Add the asset to the project folder first, then reference it locally.

## Image Guidance

Use crisp product screenshots and process artifacts. Keep the imagery quiet and clear: before state, prototype iterations, final feature, and evidence of impact.

## Case Studies

The homepage includes four project cards. Keep three if Yoonji has three strong projects, or keep all four if the fourth adds a distinct skill. Duplicate `case-study.html` for each real project and update each card link.

## Point Color

The template uses a muted plum as the point color. To change it, edit `--point`, `--point-dark`, and `--point-soft` in `styles.css`, then keep `design-tokens.json` in sync.
