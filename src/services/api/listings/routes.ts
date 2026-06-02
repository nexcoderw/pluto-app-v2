import type { ListingCategorySlug } from "./types";

export const LISTING_ROUTES = {
	cars: "/listings/cars",
	apartments: "/listings/apartments",
	hotelRooms: "/listings/hotel-rooms",
	airbnb: "/listings/airbnb",
	detail: (category: ListingCategorySlug, listingId: string) =>
		`/listings/${category}/${listingId}`,
} as const;
