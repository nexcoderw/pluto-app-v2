# API Endpoint Rules

Backend endpoint calls must be small, typed, and organized by feature.

## Folder Structure

Use this structure:

```txt
src/services/api/
	auth/
		login.ts
		forgot-password.ts
		reset-password.ts
		refresh-session.ts
		logout.ts
	products/
		list-products.ts
		get-product.ts
	bookings/
		create-booking.ts
		list-my-bookings.ts
	reference-airports/
		search-airports.ts
	client.ts
```

## Rules

- Each backend endpoint must live in its own file.
- Feature directories may group related endpoint files.
- Do not place many unrelated endpoint functions in `client.ts`.
- `client.ts` should only configure the shared HTTP client, interceptors, and shared error normalization.
- Use typed request and response shapes.
- Never expose backend secrets, refresh tokens, reset tokens, or provider credentials in frontend code.
- Add short section comments in endpoint files to explain request shape, response shape, and error normalization.
