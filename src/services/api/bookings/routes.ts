export const BOOKING_ROUTES = {
	create: "/bookings",
	cancel: (bookingId: string) => `/bookings/${bookingId}/cancel`,
	availability: (productId: string) => `/listings/${productId}/availability`,
} as const;
