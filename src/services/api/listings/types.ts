import type {
	Product,
	ProductDetailResponse,
	ProductListResponse,
} from "../products";

export type ListingCategorySlug =
	| "cars"
	| "apartments"
	| "hotel-rooms"
	| "airbnb";

export type ListingOrderBy = "createdAt" | "basePrice" | "title";
export type ListingSortOrder = "asc" | "desc";

export type ListingListRequest = {
	page?: number;
	limit?: number;
	search?: string;
	city?: string;
	country?: string;
	minPrice?: number;
	maxPrice?: number;
	sortBy?: ListingOrderBy;
	sortOrder?: ListingSortOrder;
	make?: string;
	model?: string;
	transmission?: string;
	fuelType?: string;
	seats?: number;
	minYear?: number;
	maxYear?: number;
	bedrooms?: number;
	bathrooms?: number;
	guests?: number;
	furnished?: boolean;
	wifi?: boolean;
	parking?: boolean;
	roomType?: string;
	bedType?: string;
	breakfastIncluded?: boolean;
	propertyType?: string;
	entirePlace?: boolean;
	selfCheckIn?: boolean;
	allowPets?: boolean;
	amenity?: string;
};

export type ListingListResponse = ProductListResponse;
export type ListingDetailResponse = ProductDetailResponse;
export type PublicListing = Product;
