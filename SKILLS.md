# AI Usage Guide for Yoonji Nam's Portfolio

Use this file when asking an AI assistant to help edit or extend this portfolio.

## Portfolio Goal

This site represents Yoonji Nam, a product designer in Seoul, South Korea who is seeking a full-time product design role. Keep the tone polished, restrained, and hiring-focused. Do not position Yoonji as a freelancer.

## Design Direction

- Keep the interface minimal, editorial, and sophisticated.
- Use white as the primary page background.
- Use the muted plum point color from `design-tokens.json`.
- Avoid orange, loud gradients, decorative blobs, and overly bold typography.
- Keep case study cards visually consistent and equal in size.
- Use clear product screenshots, process artifacts, and prototype images instead of decorative stock imagery.

## Asset Rules

Only use images and icons that live inside this project folder.

- Images must be stored in `/Users/username/Desktop/AI Prototyping Studio/images/`.
- Icons must be stored in `/Users/username/Desktop/AI Prototyping Studio/icons/`.
- Do not link to external image URLs.
- Do not use icons from a CDN or remote icon library unless the icon file has been added to the local `icons` folder first.
- When referencing local assets in HTML or CSS, use relative paths from the file being edited.

Examples:

```html
<img src="images/case-study-hero.png" alt="Final AI-prototyped feature screen" />
<img src="icons/arrow-up-right.svg" alt="" aria-hidden="true" />
```

```css
.project-preview {
  background-image: url("images/project-preview.png");
}
```

## Case Study Guidance

Each case study should explain:

- The existing product or flow.
- The user problem or product friction.
- How Yoonji used AI prototyping to explore solutions.
- The feature or interaction she designed.
- What improved for users, stakeholders, or the product team.

Prefer concrete evidence over generic claims. Useful evidence includes before-after screens, user quotes, usability findings, faster prototype cycles, reduced task steps, or product metrics.

## Resume Guidance

The resume section should stay concise. Prioritize full-time roles, product scope, shipped work, collaboration with PMs and engineers, and measurable design impact.

## Editing Checklist

Before finishing any AI-generated update:

- Confirm all image paths point to `images/`.
- Confirm all icon paths point to `icons/`.
- Confirm placeholder copy still tells Yoonji what to add.
- Confirm the site does not introduce beige backgrounds or orange accents.
- Confirm typography remains light and polished.
