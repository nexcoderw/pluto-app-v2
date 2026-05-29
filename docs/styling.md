# Styling Rules

Use Tailwind, shadcn, and CSS modules deliberately.

## Global CSS

`src/app/globals.css` should contain only:

- Tailwind imports
- design tokens
- base typography
- reusable global primitives
- font variables
- common glass utility classes when reused across many pages

Do not put all page or component styling in `globals.css`.

## CSS Modules

Use `.module.css` for page-specific or component-specific design:

```txt
src/components/shared/navbar.tsx
src/components/shared/navbar.module.css
```

## Indentation

Use tabs for indentation in frontend source files.

## Comments

Use short comments to mark meaningful sections:

- state
- derived values
- handlers
- render
- accessibility notes
