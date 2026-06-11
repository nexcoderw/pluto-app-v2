export const BOOKING_ROUTES = {
	create: "/bookings",
	myList: "/bookings/my",
	cancel: (bookingId: string) => `/bookings/${bookingId}/cancel`,
	partnerList: "/partner/bookings",
	partnerStatus: (bookingId: string) => `/partner/bookings/${bookingId}/status`,
	availability: (productId: string) => `/listings/${productId}/availability`,
} as const;
