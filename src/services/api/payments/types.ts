export type PaymentIntentStatus =
	| "CREATED"
	| "ACTION_REQUIRED"
	| "PROCESSING"
	| "SUCCEEDED"
	| "FAILED"
	| "CANCELLED"
	| "EXPIRED"
	| "UNKNOWN"
	| "REVERSED"
	| "PARTIALLY_REFUNDED"
	| "REFUNDED";

export type PaymentAttemptStatus =
	| "CREATED"
	| "SUBMITTED"
	| "ACTION_REQUIRED"
	| "PROCESSING"
	| "SUCCEEDED"
	| "FAILED"
	| "UNKNOWN"
	| "CANCELLED";

export type PaymentNetwork = "MTN_MOMO" | "AIRTEL_MONEY";

export type PriceQuote = {
	id: string;
	quoteNo: string;
	productId: string | null;
	startDate: string | null;
	endDate: string | null;
	guests: number | null;
	quantity: number;
	subtotalMinor: string;
	serviceFeeMinor: string;
	taxMinor: string;
	discountMinor: string;
	totalMinor: string;
	currency: string;
	status: string;
	expiresAt: string;
	createdAt: string;
	inventoryHold?: {
		id: string;
		holdNo: string;
		status: string;
		expiresAt: string;
	} | null;
};

export type CheckoutSession = {
	id: string;
	sessionNo: string;
	status: string;
	expiresAt: string;
	createdAt: string;
	priceQuote: PriceQuote;
	paymentIntent: {
		id: string;
		intentNo: string;
		gateway: "XENTRIPAY";
		environment: "SANDBOX" | "PRODUCTION";
		amountMinor: string;
		capturedMinor: string;
		refundedMinor: string;
		currency: string;
		status: PaymentIntentStatus;
		expiresAt: string;
		createdAt: string;
	};
};

export type PaymentAttempt = {
	id: string;
	attemptNo: string;
	sequence: number;
	method: "MOBILE_MONEY";
	network: PaymentNetwork | null;
	maskedAccount: string | null;
	amountMinor: string;
	currency: string;
	status: PaymentAttemptStatus;
	providerStatus: string | null;
	actionExpiresAt: string | null;
	submittedAt: string | null;
	lastCheckedAt: string | null;
	succeededAt: string | null;
	failedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type PaymentIntent = {
	id: string;
	intentNo: string;
	bookingId: string | null;
	gateway: "XENTRIPAY";
	environment: "SANDBOX" | "PRODUCTION";
	method: "MOBILE_MONEY" | null;
	network: PaymentNetwork | null;
	amountMinor: string;
	capturedMinor: string;
	refundedMinor: string;
	currency: string;
	status: PaymentIntentStatus;
	expiresAt: string;
	succeededAt: string | null;
	failedAt: string | null;
	cancelledAt: string | null;
	createdAt: string;
	updatedAt: string;
	checkoutSession: {
		id: string;
		sessionNo: string;
		status: string;
		expiresAt: string;
	};
	priceQuote: Omit<
		PriceQuote,
		| "subtotalMinor"
		| "serviceFeeMinor"
		| "taxMinor"
		| "discountMinor"
		| "inventoryHold"
	> & {
		product: {
			id: string;
			title: string;
			category: "CAR" | "APARTMENT" | "HOTEL_ROOM" | "AIRBNB_HOUSE";
		} | null;
	};
	attempts: PaymentAttempt[];
};

export type CreateListingQuotePayload = {
	productId: string;
	startDate: string;
	endDate: string;
	guests?: number;
	quantity?: number;
	idempotencyKey: string;
};

export type CreateCheckoutPayload = {
	priceQuoteId: string;
	idempotencyKey: string;
};

export type InitiatePaymentAttemptPayload = {
	method: "MOBILE_MONEY";
	network: PaymentNetwork;
	phoneNumber: string;
	idempotencyKey: string;
};

export type CreateListingQuoteResponse = {
	message: string;
	replayed: boolean;
	quote: PriceQuote;
};

export type CreateCheckoutResponse = {
	message: string;
	replayed: boolean;
	checkout: CheckoutSession;
};

export type PaymentIntentResponse = {
	message: string;
	payment: PaymentIntent;
};

export type ListPaymentIntentsRequest = {
	page?: number;
	limit?: number;
	status?: PaymentIntentStatus;
};

export type ListPaymentIntentsResponse = {
	items: PaymentIntent[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
};
