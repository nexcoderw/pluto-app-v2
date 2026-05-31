# Component Structure

Components must be organized by ownership and reuse.

## Required Folders

```txt
src/components/
	shared/
		navbar.tsx
		navbar.module.css
	auth/
		login-form.tsx
		login-form.module.css
	product/
		product-card.tsx
		product-card.module.css
	ui/
```

## Rules

- `src/components/ui` is for shadcn components and must remain available.
- Shared components used across multiple pages belong in `src/components/shared`.
- Page or feature components belong in a named feature directory.
- Do not put large page-specific components inside `src/app` when they can be extracted.
- Components should include clear comments for major sections such as state setup, event handlers, and render sections.
- Reusable components should accept typed props and avoid hidden global behavior.
- Forms must compose fields from `src/components/ui/input.tsx`, `src/components/ui/select.tsx`, and `src/components/ui/button.tsx` instead of custom one-off input/select/button shells.
- Inputs must include icons; buttons must include icons; selects must visually align to input height.
