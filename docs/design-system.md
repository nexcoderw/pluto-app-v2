# Design System Rules

The customer frontend must feel premium, calm, and trustworthy.

## Brand

- Primary color: `#02006c`.
- Font: Outfit.
- UI style: premium glassmorphism.
- Avoid gradient backgrounds.
- Avoid one-note palettes; use restrained neutrals with the primary color as an anchor.

## Glassmorphism

Use glass surfaces intentionally:

- translucent background
- subtle border
- soft shadow
- backdrop blur
- readable foreground contrast

Do not stack glass cards inside glass cards.

## Buttons

- Every button must include an icon.
- Every button must use the same height as the shared input component.
- Every button must use `cursor: pointer`.
- Submit buttons must show only a loading icon while submitting.
- Disabled buttons must visually communicate disabled state.

## Form Controls

- Every input must use `src/components/ui/input.tsx`.
- Every input must include a visible leading icon.
- Inputs must match the login input height and rounded-full visual treatment.
- Every select trigger must use `src/components/ui/select.tsx`.
- Select triggers must use the same height as the shared input component.

## Responsiveness

Design and test for:

- desktop
- laptop
- tablet
- smartphone

Text must not overflow buttons, cards, nav items, forms, or modals.
