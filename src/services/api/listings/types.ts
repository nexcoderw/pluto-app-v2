import type {
	Product,
	ProductDetailResponse,
	ProductListResponse,
} from "../products";
import type {
	AirbnbPropertyType,
	BedType,
	CarFuelType,
	CarTransmission,
	HotelRoomType,
} from "../listing-options";

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
	transmission?: CarTransmission;
	fuelType?: CarFuelType;
	seats?: number;
	minYear?: number;
	maxYear?: number;
	bedrooms?: number;
	bathrooms?: number;
	guests?: number;
	roomType?: HotelRoomType;
	bedType?: BedType;
	propertyType?: AirbnbPropertyType;
	amenity?: string;
};

export type ListingListResponse = ProductListResponse;
export type ListingDetailResponse = ProductDetailResponse;
export type PublicListing = Product;
