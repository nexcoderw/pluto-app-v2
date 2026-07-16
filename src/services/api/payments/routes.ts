export const PAYMENT_ROUTES = {
	listingQuotes: "/quotes/listings",
	checkouts: "/checkouts",
	intents: "/payments/intents",
	intent: (paymentIntentId: string) =>
		`/payments/intents/${paymentIntentId}`,
	attempts: (paymentIntentId: string) =>
		`/payments/intents/${paymentIntentId}/attempts`,
	reconcile: (paymentIntentId: string) =>
		`/payments/intents/${paymentIntentId}/reconcile`,
} as const;
