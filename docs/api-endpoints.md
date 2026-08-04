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
	payments/
		create-listing-quote.ts
		create-checkout.ts
		initiate-payment-attempt.ts
		get-payment-intent.ts
		list-payment-intents.ts
		reconcile-payment-intent.ts
	exchange-rates/
		get-current-exchange-rate.ts
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

## Customer Checkout Endpoints

```txt
POST /quotes/listings
GET  /reference/exchange-rates/current
POST /checkouts
GET  /payments/intents
GET  /payments/intents/:paymentIntentId
POST /payments/intents/:paymentIntentId/attempts
POST /payments/intents/:paymentIntentId/reconcile
```

Quote and checkout requests must never contain a browser-calculated amount.
Payment attempts send only the canonical intent identifier, mobile-money method,
network, phone number, and an idempotency key. XentriPay is never called from
the browser.

Checkout creation sends the server-issued quote identifier, the exact terms
version displayed and accepted by the customer, and an idempotency key. It does
not send an amount, exchange rate, fee, tax, or payment status.
