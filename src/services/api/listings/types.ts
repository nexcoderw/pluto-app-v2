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
	airConditioning?: boolean;
	driverIncluded?: boolean;
	bedrooms?: number;
	bathrooms?: number;
	guests?: number;
	furnished?: boolean;
	wifi?: boolean;
	parking?: boolean;
	roomType?: HotelRoomType;
	bedType?: BedType;
	breakfastIncluded?: boolean;
	hasAirConditioning?: boolean;
	hasPrivateBathroom?: boolean;
	propertyType?: AirbnbPropertyType;
	entirePlace?: boolean;
	selfCheckIn?: boolean;
	allowPets?: boolean;
	amenity?: string;
};

export type ListingListResponse = ProductListResponse;
export type ListingDetailResponse = ProductDetailResponse;
export type PublicListing = Product;
