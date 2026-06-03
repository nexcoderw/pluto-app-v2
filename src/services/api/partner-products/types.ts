import type {
	PricingUnit,
	Product,
	ProductCategory,
	ProductListRequest,
	ProductListResponse,
	ProductStatus,
} from "../products";

export type CreateCarProductRequest = {
	title: string;
	description: string;
	shortDescription?: string;
	city: string;
	country?: string;
	basePrice: string;
	currency?: string;
	pricingUnit?: PricingUnit;
	brand: string;
	model: string;
	year: number;
	plateNumber?: string;
	transmission: string;
	fuelType: string;
	seats: number;
	doors: number;
	luggageCapacity?: number;
	airConditioning?: boolean;
	driverIncluded?: boolean;
	insuranceIncluded?: boolean;
	mileageLimitPerDay?: number;
	minimumDriverAge?: number;
	requiresDeposit?: boolean;
	depositAmount?: string;
};

export type ListingLocationRequest = {
	locationName?: string;
	locationAddress?: string;
	locationLatitude: number;
	locationLongitude: number;
};

export type CreateApartmentProductRequest =
	ProductBaseRequest & {} & ListingLocationRequest & {
			bedrooms: number;
			bathrooms: number;
			kitchens?: number;
			livingRooms?: number;
			furnished?: boolean;
			wifi?: boolean;
			parking?: boolean;
			floorNumber?: number;
			maxGuests: number;
			hasBalcony?: boolean;
			hasSecurity?: boolean;
		};

export type CreateHotelRoomProductRequest =
	ProductBaseRequest & {} & ListingLocationRequest & {
			hotelName: string;
			roomType: string;
			bedType: string;
			roomSizeSqm?: number;
			breakfastIncluded?: boolean;
			checkInTime: string;
			checkOutTime: string;
			maxGuests: number;
			roomNumber?: string;
			hasAirConditioning?: boolean;
			hasPrivateBathroom?: boolean;
		};

export type CreateAirbnbHouseProductRequest =
	ProductBaseRequest & {} & ListingLocationRequest & {
			houseType: string;
			entirePlace?: boolean;
			selfCheckIn?: boolean;
			houseRules?: string;
			cleaningFee?: string;
			bedrooms: number;
			bathrooms: number;
			maxGuests: number;
			allowPets?: boolean;
			allowSmoking?: boolean;
			allowParties?: boolean;
		};

export type ProductBaseRequest = {
	title: string;
	description: string;
	shortDescription?: string;
	city: string;
	country?: string;
	basePrice: string;
	currency?: string;
	pricingUnit?: PricingUnit;
};

export type CreateListingRequest = (
	| CreateCarProductRequest
	| CreateApartmentProductRequest
	| CreateHotelRoomProductRequest
	| CreateAirbnbHouseProductRequest
) & {
	category: ProductCategory;
};

export type UpdateListingRequest = Partial<
	CreateListingRequest & {
		category?: ProductCategory;
	}
>;

export type DeleteListingRequest = {
	confirmationTitle: string;
};

export type PartnerProductListRequest = ProductListRequest & {
	status?: ProductStatus;
	limit?: number;
};
export type PartnerProductListResponse = ProductListResponse;

export type PartnerProductResponse = {
	message?: string;
	product: Product;
};

export type UploadProductImageRequest = {
	productId: string;
	file: File;
	altText?: string;
	isCover?: boolean;
	sortOrder?: number;
};

export type UpdateProductImageRequest = {
	productId: string;
	imageId: string;
	altText?: string;
	isCover?: boolean;
	sortOrder?: number;
};

export type DeleteProductImageRequest = {
	productId: string;
	imageId: string;
};
