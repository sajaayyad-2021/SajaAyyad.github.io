# Awesome Portfolio (BEM + SCSS + Accessibility)

This project is a starter template designed to meet the rubric:
- Wireframes-aligned layout (logo opposite of navbar).
- Responsive (desktop, tablet, mobile) with no overflow.
- SCSS with BEM structure (base / blocks / utils) and compiled `dist/main.css`.
- Variables & mixins, nesting, and limited depth for readability.
- Advanced CSS features: calc(), scroll-snap, color-scheme media query, backdrop-filter, min()/max().
- Animations & transitions with `prefers-reduced-motion` support.
- Dynamic behavior: shrinking header on scroll.
- Accessibility: semantic HTML, correct headings order, labels with inputs, aria-labels, visible focus, high contrast mode-ready.

## Structure
```
scss/
  base/
    _reset.scss
    _typography.scss
  blocks/
    _header.scss
    _hero.scss
    _projects.scss
    _skills.scss
    _contact.scss
    _footer.scss
  utils/
    _variables.scss
    _mixins.scss
  main.scss
dist/
  main.css
js/
  main.js
assets/
  img/
  logo.svg
index.html
```

## Build (optional)
If you want to recompile SCSS locally:
1. `npm init -y`
2. `npm i -D sass`
3. Run: `npx sass scss/main.scss dist/main.css --no-source-map --style=compressed`
