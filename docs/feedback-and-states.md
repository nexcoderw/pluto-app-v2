# Feedback and State Rules

Every flow must handle loading, success, error, and empty states.

## Loading State

- Use skeleton loading.
- Do not use text-only loading screens for page content.
- Submit buttons must show only a loading icon and be disabled.

## Success State

- Tell the user what happened.
- Include the next action when useful.

## Error State

Use three error display types:

- Toast error: temporary, low-importance feedback.
- Modal error: centered, blocking, and not closable until the user responds.
- Inline error: next to the field or UI element that failed.

Forms must show red borders and inline error text for invalid fields.

## Empty State

- Explain why the state is empty.
- Provide one clear action.
