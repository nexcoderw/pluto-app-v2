export const LISTING_REVIEW_ROUTES = {
	list: (listingId: string) => `/listings/${listingId}/reviews`,
	summary: (listingId: string) => `/listings/${listingId}/reviews/summary`,
	me: (listingId: string) => `/listings/${listingId}/reviews/me`,
} as const;
