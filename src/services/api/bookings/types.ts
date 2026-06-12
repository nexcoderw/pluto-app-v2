export type BookingStatus =
	| "PENDING"
	| "CONFIRMED"
	| "CANCELLED_BY_CUSTOMER"
	| "CANCELLED_BY_PARTNER"
	| "CANCELLED"
	| "COMPLETED"
	| "REJECTED"
	| "EXPIRED";

export type BookingPaymentStatus =
	| "PENDING"
	| "PROCESSING"
	| "PAID"
	| "FAILED"
	| "CANCELLED"
	| "REFUNDED"
	| "PARTIALLY_REFUNDED";

export type BookingProductCategory =
	| "CAR"
	| "APARTMENT"
	| "HOTEL_ROOM"
	| "AIRBNB_HOUSE";

export type BookingOrderBy =
	| "createdAt"
	| "startDate"
	| "endDate"
	| "totalAmount"
	| "status";

export type BookingSortOrder = "asc" | "desc";

export type ListingAvailabilityRequest = {
	startDate?: string;
	endDate?: string;
};

export type ListingAvailabilityBlockedRange = {
	id: string;
	source: "BOOKING" | "MANUAL_BLOCK";
	status?: BookingStatus;
	reason?: string | null;
	blocksBooking?: boolean;
	showBookedMarker?: boolean;
	isOwnBooking?: boolean;
	bookingNo?: string | null;
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
	unavailableRanges?: ListingAvailabilityBlockedRange[];
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

export type ListBookingsRequest = {
	page?: number;
	limit?: number;
	search?: string;
	status?: BookingStatus;
	paymentStatus?: BookingPaymentStatus;
	category?: BookingProductCategory;
	orderBy?: BookingOrderBy;
	order?: BookingSortOrder;
};

export type UpdatePartnerBookingStatusPayload = {
	status: "CANCELLED_BY_PARTNER" | "COMPLETED" | "REJECTED";
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
		slug?: string;
		category: BookingProductCategory;
		city: string;
		country: string;
		ownerId: string;
		images?: Array<{
			id: string;
			isCover: boolean;
			altText: string | null;
			file: {
				publicUrl: string | null;
			};
		}>;
		owner?: {
			id: string;
			fullName: string;
			email: string;
			imageKey: string | null;
		};
	};
	customer?: {
		id: string;
		fullName: string;
		email: string;
		phone: string | null;
		imageKey: string | null;
	};
	statusHistory?: Array<{
		id: string;
		fromStatus: BookingStatus | null;
		toStatus: BookingStatus;
		reason: string | null;
		createdAt: string;
		changedById: string | null;
	}>;
};

export type CreateBookingResponse = {
	message: string;
	booking: BookingSummary;
};

export type CancelBookingResponse = {
	message: string;
	booking: BookingSummary;
};

export type ListBookingsResponse = {
	items: BookingSummary[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
		orderBy: BookingOrderBy;
		order: BookingSortOrder;
	};
};

export type BookingDetailResponse = {
	booking: BookingSummary;
};

export type UpdatePartnerBookingStatusResponse = {
	message: string;
	booking: BookingSummary;
};
