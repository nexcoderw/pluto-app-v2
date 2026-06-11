export type BookingStatus =
	| "PENDING"
	| "CONFIRMED"
	| "CANCELLED_BY_CUSTOMER"
	| "CANCELLED_BY_PARTNER"
	| "CANCELLED"
	| "COMPLETED"
	| "EXPIRED"
	| "NO_SHOW";

export type BookingPaymentStatus =
	| "UNPAID"
	| "AUTHORIZED"
	| "PAID"
	| "PARTIALLY_REFUNDED"
	| "REFUNDED"
	| "FAILED";

export type ListingAvailabilityRequest = {
	startDate?: string;
	endDate?: string;
};

export type ListingAvailabilityBlockedRange = {
	id: string;
	source: "BOOKING" | "MANUAL_BLOCK";
	status?: BookingStatus;
	reason?: string | null;
	startDate: string;
	endDate: string;
};

export type ListingAvailabilityResponse = {
	productId: string;
	range: {
		startDate: string;
		endDate: string;
	};
	blockingStatuses: BookingStatus[];
	blockedRanges: ListingAvailabilityBlockedRange[];
};

export type CreateBookingPayload = {
	productId: string;
	startDate: string;
	endDate: string;
	guests?: number;
	quantity?: number;
	customerNote?: string;
};

export type CancelBookingPayload = {
	reason?: string;
};

export type BookingSummary = {
	id: string;
	bookingNo: string;
	customerId: string;
	productId: string;
	startDate: string;
	endDate: string;
	guests: number | null;
	quantity: number;
	subtotalAmount: string;
	serviceFee: string;
	taxAmount: string;
	discountAmount: string;
	totalAmount: string;
	currency: string;
	status: BookingStatus;
	paymentStatus: BookingPaymentStatus;
	customerNote: string | null;
	cancellationReason: string | null;
	confirmedAt: string | null;
	cancelledAt: string | null;
	completedAt: string | null;
	expiresAt: string | null;
	createdAt: string;
	updatedAt: string;
	totalDays: number;
	product: {
		id: string;
		title: string;
		category: string;
		city: string;
		country: string;
		ownerId: string;
	};
};

export type CreateBookingResponse = {
	message: string;
	booking: BookingSummary;
};

export type CancelBookingResponse = {
	message: string;
	booking: BookingSummary;
};
