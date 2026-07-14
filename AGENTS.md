# PLUTO Customer Frontend Agent Instructions

These instructions apply to the whole `app/app` project.

## Required Reading

Before changing frontend code, read:

- `docs/README.md` for the documentation map.
- `docs/api-endpoints.md` before adding backend calls.
- `docs/component-structure.md` before adding components.
- `docs/design-system.md` before designing UI.
- `docs/styling.md` before editing CSS.
- `docs/feedback-and-states.md` before handling loading, success, error, or empty states.
- `docs/listing-categories.md` before changing listing, product, public listings, or admin review flows.
- `docs/payment-readiness.md` before changing booking, quote, payment, flight-payment, payout, or refund flows.
- `docs/seo.md` before adding pages.
- `docs/git.md` before reporting commit commands.

## Core Rules

- Use tabs for indentation in frontend source files.
- Use Outfit as the primary font.
- Use `#02006c` as the primary brand color.
- Build premium glassmorphism UI without gradient backgrounds.
- Keep layouts responsive for desktop, laptop, tablet, and smartphone.
- Keep `src/components/ui` for shadcn components.
- Put shared app components in `src/components/shared`.
- Put page or feature-specific components in feature folders like `src/components/auth`.
- Use `.module.css` files for component/page-specific design.
- Keep `globals.css` limited to tokens, base styles, and reusable project primitives.
- Every input must use `src/components/ui/input.tsx`, match the login input height and rounded-full shape, and include a visible leading icon.
- Every select trigger must use `src/components/ui/select.tsx` and match the shared input height.
- Every button must match the shared input height and include an icon.
- Every button must have an icon, `cursor: pointer`, and a clear accessible label.
- Submit buttons must show only a loading icon while submitting and must be disabled.
- Every page must define professional SEO metadata and a dynamic title.
- Every user-facing flow must define loading, success, error, and empty states with actions except loading, which uses skeletons.
- Do not run `npm run build` or `npm run lint` automatically. Tell the user to
  run those commands instead and wait for their result when verification is
  needed.
